"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import ItemCard from "@/app/components/item-card"
import FiltersSidebar from "@/app/components/filters-sidebar"
import { LayoutGrid, List, ChevronDown, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import { useItems, useProfile, useFavorites, useToggleFavorite } from "@/app/lib/queries"

interface FilterState {
  categories: number[]
  conditions: string[]
  distance: string[]
  minRating: string[]
}

interface TransformedItem {
  id: string
  title: string
  category: string
  image: string
  condition: "New" | "Good" | "Used" | "Damaged"
  ownerName: string
  ownerRating: number
  location: string
  distance?: string
  isFavorite?: boolean
}

export default function BrowsePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"closest" | "newest" | "rating">("closest")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    conditions: [],
    distance: [],
    minRating: [],
  })

  // Get user profile for location-based sorting
  const { data: profile } = useProfile()
  const userLocation = profile && typeof profile === 'object' ? (profile as any) : null

  // Get favorites if authenticated
  const { data: favoritesData } = useFavorites()
  const favoriteItemIds = useMemo(() => {
    if (!favoritesData) return new Set<string>()
    const favoritesArray = Array.isArray((favoritesData as any).results)
      ? (favoritesData as any).results
      : Array.isArray(favoritesData)
      ? favoritesData
      : []
    return new Set(favoritesArray.map((fav: any) => String(fav.item || fav.id)))
  }, [favoritesData])

  const toggleFavorite = useToggleFavorite()

  // Build API params from filters
  const apiParams = useMemo(() => {
    const params: Record<string, string> = {
      ordering: sortBy === "closest" ? "distance" : sortBy === "newest" ? "-created_at" : "-ownerrating",
    }

    // Add category filter (if single category selected)
    if (filters.categories.length === 1) {
      params.category = String(filters.categories[0])
    }

    // Add condition filter (if any selected)
    if (filters.conditions.length > 0) {
      // API expects single condition, so we'll filter client-side if multiple
      if (filters.conditions.length === 1) {
        params.condition = filters.conditions[0].toLowerCase()
      }
    }

    // Add minimum rating filter
    if (filters.minRating.length > 0) {
      const minRating = filters.minRating[0]
      if (minRating !== "All") {
        params.min_rating = minRating.replace("+", "")
      }
    }

    // Add location for distance calculation
    if (userLocation?.latitude && userLocation?.longitude) {
      params.latitude = String(userLocation.latitude)
      params.longitude = String(userLocation.longitude)
    }

    // Add max distance filter
    if (filters.distance.length > 0) {
      const distanceFilter = filters.distance[0]
      if (distanceFilter === "Within 5 km") {
        params.max_distance = "5"
      } else if (distanceFilter === "5-10 km") {
        params.max_distance = "10"
      } else if (distanceFilter === "10-20 km") {
        params.max_distance = "20"
      }
      // 20+ km means no max distance limit
    }

    return params
  }, [filters, sortBy, userLocation])

  // Fetch items
  const { data: itemsData, isLoading, error } = useItems(apiParams)

  // Transform API data to match ItemCard format
  const items = useMemo<TransformedItem[]>(() => {
    if (!itemsData) return []

    // Handle paginated response or array
    const itemsArray = Array.isArray((itemsData as any).results)
      ? (itemsData as any).results
      : Array.isArray(itemsData)
      ? itemsData
      : []

    let transformed = itemsArray.map((item: any) => {
      // Get first image or placeholder
      // Backend provides photos and images as arrays of URL strings
      let image = "/placeholder.svg"
      if (item.photos && Array.isArray(item.photos) && item.photos.length > 0) {
        image = item.photos[0] || "/placeholder.svg"
      } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        // images is an alias for photos, also an array of URL strings
        image = item.images[0] || "/placeholder.svg"
      } else if (item.photos && typeof item.photos === 'string') {
        image = item.photos
      } else if (item.image && typeof item.image === 'string') {
        image = item.image
      }

      // Map condition from API format to display format
      const conditionMap: Record<string, "New" | "Good" | "Used" | "Damaged"> = {
        new: "New",
        good: "Good",
        used: "Used",
        damaged: "Damaged",
      }
      const condition = conditionMap[item.condition?.toLowerCase()] || "Good"

      // Get category name
      const categoryName = item.category?.name || item.category || "Uncategorized"

      // Get owner info
      const owner = item.owner || {}
      const ownerName = owner.full_name || owner.username || owner.name || "Unknown"
      // Backend provides ownerrating at item level, fallback to owner.rating or owner.lender_rating
      const ownerRating = item.ownerrating || owner.rating || owner.lender_rating || 0

      // Get location
      const location = item.location || owner.location || "Unknown"

      // Get distance
      let distance: string | undefined
      if (item.distance !== undefined && item.distance !== null) {
        distance = `${Number(item.distance).toFixed(1)} km`
      }

      return {
        id: String(item.id),
        title: item.title || "Untitled",
        category: categoryName,
        image,
        condition,
        ownerName,
        ownerRating: Number(ownerRating),
        location,
        distance,
        isFavorite: favoriteItemIds.has(String(item.id)),
      }
    })

    // Apply client-side filters for multiple selections
    if (filters.categories.length > 1) {
      transformed = transformed.filter((item: TransformedItem) => {
        const itemCategoryId = itemsArray.find((i: any) => String(i.id) === item.id)?.category?.id
        return itemCategoryId && filters.categories.includes(itemCategoryId)
      })
    }

    if (filters.conditions.length > 1) {
      transformed = transformed.filter((item: TransformedItem) => {
        const conditionMap: Record<string, string> = {
          New: "new",
          Good: "good",
          Used: "used",
          Damaged: "damaged",
        }
        const apiCondition = conditionMap[item.condition]
        return apiCondition && filters.conditions.includes(apiCondition)
      })
    }

    // Sort items
    if (sortBy === "closest") {
      transformed.sort((a: TransformedItem, b: TransformedItem) => {
        const distA = a.distance ? parseFloat(a.distance) : Infinity
        const distB = b.distance ? parseFloat(b.distance) : Infinity
        return distA - distB
      })
    } else if (sortBy === "newest") {
      // Already sorted by API, but we can re-sort if needed
      transformed = transformed.reverse()
    } else if (sortBy === "rating") {
      transformed.sort((a: TransformedItem, b: TransformedItem) => b.ownerRating - a.ownerRating)
    }

    return transformed
  }, [itemsData, favoriteItemIds, filters, sortBy])

  const handleFavoriteToggle = async (itemId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await toggleFavorite.mutateAsync(Number(itemId))
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Browse Items</h1>
            <p className="text-muted-foreground">Discover items available in your community</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 p-4 bg-card rounded-lg border border-border">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <span>Loading...</span>
              ) : error ? (
                <span className="text-destructive">Error loading items</span>
              ) : (
                <>
                  Showing <span className="font-semibold text-foreground">{items.length}</span> items
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-all duration-300 text-sm font-medium"
                >
                  Sort: {sortBy === "closest" ? "Closest" : sortBy === "newest" ? "Newest" : "Rating"}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
                </button>
                {showSortMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSortMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20">
                      <button
                        onClick={() => {
                          setSortBy("closest")
                          setShowSortMenu(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                          sortBy === "closest" ? "bg-muted font-semibold" : ""
                        }`}
                      >
                        Closest
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("newest")
                          setShowSortMenu(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                          sortBy === "newest" ? "bg-muted font-semibold" : ""
                        }`}
                      >
                        Newest
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("rating")
                          setShowSortMenu(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                          sortBy === "rating" ? "bg-muted font-semibold" : ""
                        }`}
                      >
                        Rating
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all duration-300 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all duration-300 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <FiltersSidebar
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>

            {/* Items Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-destructive mb-4">Failed to load items. Please try again later.</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">No items found. Try adjusting your filters.</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <ItemCard
                      key={item.id}
                      {...item}
                      onFavoriteToggle={(e) => handleFavoriteToggle(item.id, e)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-card rounded-lg border border-border cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-xs text-accent font-semibold uppercase mb-1">{item.category}</p>
                        <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.ownerName} • ⭐ {item.ownerRating.toFixed(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.location} {item.distance && `• ${item.distance}`}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleFavoriteToggle(item.id, e)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          item.isFavorite
                            ? "bg-accent/80 text-accent-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill={item.isFavorite ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
