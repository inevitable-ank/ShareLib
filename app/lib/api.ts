// API Configuration and Utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

// Token management
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

export const setTokens = (access: string, refresh: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// API request helper
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryOn401: boolean = true
): Promise<T> {
  let token = getAccessToken()
  
  // If no access token but we have refresh token, try to refresh first
  // This handles the case where access token was cleared but refresh token still exists
  if (!token && retryOn401) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await authAPI.refreshToken()
        token = getAccessToken() // Get the new access token
        // If we still don't have a token after refresh, something is wrong
        if (!token) {
          clearTokens()
          throw new Error('Failed to retrieve access token after refresh')
        }
      } catch (error) {
        // Refresh failed - clear tokens and re-throw to let caller handle it
        clearTokens()
        throw error
      }
    }
    // If no refresh token and no access token, proceed without auth header
    // The request will fail with 401, which will be handled below
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: headers as HeadersInit,
  })

  // Handle 401 Unauthorized - try to refresh token if we have a refresh token
  if (response.status === 401 && retryOn401) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await authAPI.refreshToken()
        // Retry the original request with new token
        const newToken = getAccessToken()
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: headers as HeadersInit,
          })
          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ detail: 'An error occurred' }))
            // If retry still fails with 401, refresh token is also invalid - clear tokens
            if (retryResponse.status === 401) {
              clearTokens()
            }
            throw new Error(error.detail || error.message || `HTTP error! status: ${retryResponse.status}`)
          }
          return retryResponse.json()
        } else {
          // Got new token from refresh but can't retrieve it - clear and fail
          clearTokens()
          throw new Error('Failed to retrieve new access token after refresh')
        }
      } catch (refreshError) {
        // Refresh failed (network error, invalid refresh token, etc.) - clear tokens
        clearTokens()
        throw new Error('Session expired. Please login again.')
      }
    } else {
      // No refresh token available - clear stale access token
      clearTokens()
      // Let it fall through to error handler below to throw proper error
    }
  }

  // Handle all other errors (including 401 if retryOn401 is false)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
    
    // Only clear tokens on 401 if we didn't already handle it above
    // (i.e., when retryOn401 is false or endpoint doesn't support refresh)
    if (response.status === 401 && !retryOn401) {
      clearTokens()
    }
    
    throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Authentication API
export const authAPI = {
  loginWithEmail: async (email: string, password: string) => {
    const response = await apiRequest<{ access: string; refresh: string }>(
      '/auth/login/email/',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
    setTokens(response.access, response.refresh)
    return response
  },

  register: async (data: {
    username: string
    email: string
    password: string
    password2: string
    first_name?: string
    last_name?: string
    location?: string
  }) => {
    return apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getProfile: async () => {
    return apiRequest('/auth/register/profile/')
  },

  updateProfile: async (data: {
    first_name?: string
    last_name?: string
    email?: string
    location?: string
    avatar?: string | null
  }) => {
    return apiRequest('/auth/register/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  refreshToken: async () => {
    const refresh = getRefreshToken()
    if (!refresh) throw new Error('No refresh token available')
    
    // Don't retry on 401 for refresh token call to avoid infinite loop
    const response = await apiRequest<{ access: string }>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }, false)
    
    const accessToken = response.access
    const refreshToken = getRefreshToken() // Keep existing refresh token
    if (refreshToken) {
      setTokens(accessToken, refreshToken)
    }
    
    return response
  },
}

// Users API
export const usersAPI = {
  getUser: async (id: number | string) => {
    return apiRequest(`/users/${id}/`)
  },

  getStats: async () => {
    return apiRequest('/users/me/stats/')
  },
}

// Items API
export const itemsAPI = {
  getItems: async (params?: {
    category?: number
    status?: string
    condition?: string
    owner?: number
    search?: string
    ordering?: string
    page?: number
  }) => {
    // Filter out undefined/null values to prevent them from being added to query string
    const filteredParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
        )
      : {}
    
    const queryString = Object.keys(filteredParams).length > 0
      ? '?' + new URLSearchParams(filteredParams as Record<string, string>).toString()
      : ''
    return apiRequest(`/items/${queryString}`)
  },

  getItem: async (id: number | string) => {
    return apiRequest(`/items/${id}/`)
  },

  createItem: async (data: FormData) => {
    const token = getAccessToken()
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    // Don't set Content-Type for FormData, browser will set it with boundary

    const response = await fetch(`${API_BASE_URL}/items/`, {
      method: 'POST',
      headers,
      body: data,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  updateItem: async (id: number | string, data: FormData | object) => {
    const isFormData = data instanceof FormData
    const token = getAccessToken()
    const headers: HeadersInit = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    const body = isFormData ? data : JSON.stringify(data)

    const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
      method: 'PATCH',
      headers,
      body,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  deleteItem: async (id: number | string) => {
    return apiRequest(`/items/${id}/`, {
      method: 'DELETE',
    })
  },
}

// Borrow Requests API
export const borrowRequestsAPI = {
  getRequests: async () => {
    return apiRequest('/borrows/requests/')
  },

  createRequest: async (data: {
    item_id: number
    message?: string
    start_date?: string
    end_date?: string
  }) => {
    return apiRequest('/borrows/requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateRequest: async (id: number | string, data: { status?: string }) => {
    return apiRequest(`/borrows/requests/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteRequest: async (id: number | string) => {
    return apiRequest(`/borrows/requests/${id}/`, {
      method: 'DELETE',
    })
  },
}

// Borrow Records API
export const borrowRecordsAPI = {
  getRecords: async (params?: {
    status?: string
    borrower?: number
    owner?: number
  }) => {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : ''
    return apiRequest(`/borrows/records/${queryString}`)
  },
}

// Ratings API
export const ratingsAPI = {
  getRatings: async () => {
    return apiRequest('/ratings/')
  },

  getItemRatings: async (itemId: number | string) => {
    return apiRequest(`/ratings/item/${itemId}/`)
  },

  createRating: async (data: {
    to_user: number
    item: number
    stars: number
    message?: string
  }) => {
    return apiRequest('/ratings/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// Categories API
export const categoriesAPI = {
  getCategories: async () => {
    return apiRequest('/items/categories/')
  },
}

