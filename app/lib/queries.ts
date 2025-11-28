// TanStack Query hooks for API calls
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authAPI, usersAPI, itemsAPI, borrowRequestsAPI, ratingsAPI, categoriesAPI } from "./api"

// Query Keys
export const queryKeys = {
  auth: {
    profile: ["auth", "profile"] as const,
  },
  users: {
    all: ["users"] as const,
    detail: (id: number | string) => ["users", id] as const,
  },
  items: {
    all: (params?: Record<string, unknown>) => ["items", params] as const,
    detail: (id: number | string) => ["items", id] as const,
  },
  borrowRequests: {
    all: ["borrowRequests"] as const,
    detail: (id: number | string) => ["borrowRequests", id] as const,
  },
  ratings: {
    all: ["ratings"] as const,
    item: (itemId: number | string) => ["ratings", "item", itemId] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
}

// Auth Hooks
export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authAPI.loginWithEmail(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile })
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: {
      username: string
      email: string
      password: string
      password2: string
      first_name?: string
      last_name?: string
      location?: string
    }) => authAPI.register(data),
  })
}

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authAPI.getProfile(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("access_token"),
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      first_name?: string
      last_name?: string
      email?: string
      location?: string
      avatar?: string | null
    }) => authAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile })
    },
  })
}

// User Hooks
export const useUser = (id: number | string | undefined, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id || 0),
    queryFn: () => usersAPI.getUser(id!),
    enabled: options?.enabled !== false && !!id,
  })
}

// Item Hooks
export const useItems = (params?: {
  category?: number
  status?: string
  condition?: string
  owner?: number
  search?: string
  ordering?: string
  page?: number
}) => {
  return useQuery({
    queryKey: queryKeys.items.all(params),
    queryFn: () => itemsAPI.getItems(params),
  })
}

export const useItem = (id: number | string) => {
  return useQuery({
    queryKey: queryKeys.items.detail(id),
    queryFn: () => itemsAPI.getItem(id),
    enabled: !!id,
  })
}

export const useCreateItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: FormData) => itemsAPI.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all() })
    },
  })
}

export const useUpdateItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: FormData | object }) =>
      itemsAPI.updateItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all() })
    },
  })
}

export const useDeleteItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number | string) => itemsAPI.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all() })
    },
  })
}

// Borrow Request Hooks
export const useBorrowRequests = () => {
  return useQuery({
    queryKey: queryKeys.borrowRequests.all,
    queryFn: () => borrowRequestsAPI.getRequests(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("access_token"),
  })
}

export const useCreateBorrowRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      item_id: number
      message?: string
      start_date?: string
      end_date?: string
    }) => borrowRequestsAPI.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.borrowRequests.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all() })
    },
  })
}

export const useUpdateBorrowRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: { status?: string } }) =>
      borrowRequestsAPI.updateRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.borrowRequests.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.borrowRequests.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all() })
    },
  })
}

export const useDeleteBorrowRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number | string) => borrowRequestsAPI.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.borrowRequests.all })
    },
  })
}

// Rating Hooks
export const useRatings = () => {
  return useQuery({
    queryKey: queryKeys.ratings.all,
    queryFn: () => ratingsAPI.getRatings(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("access_token"),
  })
}

export const useItemRatings = (itemId: number | string) => {
  return useQuery({
    queryKey: queryKeys.ratings.item(itemId),
    queryFn: () => ratingsAPI.getItemRatings(itemId),
    enabled: !!itemId,
  })
}

export const useCreateRating = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      to_user: number
      item: number
      stars: number
      message?: string
    }) => ratingsAPI.createRating(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings.item(variables.item) })
    },
  })
}

// Category Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesAPI.getCategories(),
  })
}

