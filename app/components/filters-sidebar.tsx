"use client"

import { ChevronDown, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import { useCategories, useItems } from "@/app/lib/queries"

interface FilterState {
  categories: number[]
  conditions: string[]
  distance: string[]
  minRating: string[]
}

interface FiltersSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

const conditions = ["New", "Good", "Used", "Damaged"]

export default function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    condition: true,
    distance: true,
    rating: true,
  })

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()

  // Fetch all items to calculate category counts
  const { data: itemsData } = useItems()

  // Get categories with counts
  const categories = useMemo(() => {
    if (!categoriesData || !itemsData) return []

    const categoriesArray = Array.isArray(categoriesData) ? categoriesData : []
    
    // Get items array
    const itemsArray = Array.isArray((itemsData as any).results)
      ? (itemsData as any).results
      : Array.isArray(itemsData)
      ? itemsData
      : []

    // Count items per category
    const categoryCounts: Record<number, number> = {}
    itemsArray.forEach((item: any) => {
      const categoryId = item.category?.id || item.category
      if (categoryId) {
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1
      }
    })

    return categoriesArray.map((cat: any) => ({
      id: cat.id,
      name: cat.name || cat.slug || "Unknown",
      count: categoryCounts[cat.id] || 0,
    }))
  }, [categoriesData, itemsData])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId]
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const handleConditionToggle = (condition: string) => {
    const apiCondition = condition.toLowerCase()
    const newConditions = filters.conditions.includes(apiCondition)
      ? filters.conditions.filter((c) => c !== apiCondition)
      : [...filters.conditions, apiCondition]
    onFiltersChange({ ...filters, conditions: newConditions })
  }

  const handleDistanceToggle = (distance: string) => {
    const newDistance = filters.distance.includes(distance)
      ? filters.distance.filter((d) => d !== distance)
      : filters.distance.length === 0 || filters.distance[0] !== distance
      ? [distance] // Only allow one distance filter at a time
      : []
    onFiltersChange({ ...filters, distance: newDistance })
  }

  const handleRatingToggle = (rating: string) => {
    const newRating = filters.minRating.includes(rating)
      ? filters.minRating.filter((r) => r !== rating)
      : filters.minRating.length === 0 || filters.minRating[0] !== rating
      ? [rating] // Only allow one rating filter at a time
      : []
    onFiltersChange({ ...filters, minRating: newRating })
  }

  const handleResetFilters = () => {
    onFiltersChange({
      categories: [],
      conditions: [],
      distance: [],
      minRating: [],
    })
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6 h-fit sticky top-20">
      <h3 className="font-bold text-lg text-foreground">Filters</h3>

      {/* Category Filter */}
      <div>
        <button
          onClick={() => toggleSection("category")}
          className="w-full flex items-center justify-between font-semibold text-foreground hover:text-primary transition-smooth mb-3"
        >
          Category
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.category ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.category && (
          <div className="space-y-2">
            {categoriesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories available</p>
            ) : (
              categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-3 cursor-pointer hover:text-primary transition-smooth"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-muted-foreground flex-1">{cat.name}</span>
                  <span className="text-xs text-muted-foreground/70">({cat.count})</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Condition Filter */}
      <div className="border-t border-border pt-6">
        <button
          onClick={() => toggleSection("condition")}
          className="w-full flex items-center justify-between font-semibold text-foreground hover:text-primary transition-smooth mb-3"
        >
          Condition
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.condition ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.condition && (
          <div className="space-y-2">
            {conditions.map((condition) => {
              const apiCondition = condition.toLowerCase()
              return (
                <label
                  key={condition}
                  className="flex items-center gap-3 cursor-pointer hover:text-primary transition-smooth"
                >
                  <input
                    type="checkbox"
                    checked={filters.conditions.includes(apiCondition)}
                    onChange={() => handleConditionToggle(condition)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-muted-foreground">{condition}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Distance Filter */}
      <div className="border-t border-border pt-6">
        <button
          onClick={() => toggleSection("distance")}
          className="w-full flex items-center justify-between font-semibold text-foreground hover:text-primary transition-smooth mb-3"
        >
          Distance
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.distance ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.distance && (
          <div className="space-y-2">
            {["Within 5 km", "5-10 km", "10-20 km", "20+ km"].map((distance) => (
              <label
                key={distance}
                className="flex items-center gap-3 cursor-pointer hover:text-primary transition-smooth"
              >
                <input
                  type="radio"
                  name="distance"
                  checked={filters.distance.includes(distance)}
                  onChange={() => handleDistanceToggle(distance)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-muted-foreground">{distance}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Minimum Rating */}
      <div className="border-t border-border pt-6">
        <button
          onClick={() => toggleSection("rating")}
          className="w-full flex items-center justify-between font-semibold text-foreground hover:text-primary transition-smooth mb-3"
        >
          Min. Rating
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.rating ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {["4.5+", "4.0+", "3.5+", "All"].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-3 cursor-pointer hover:text-primary transition-smooth"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating.includes(rating)}
                  onChange={() => handleRatingToggle(rating)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-muted-foreground">{rating}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset Filters */}
      <button
        onClick={handleResetFilters}
        className="w-full py-2 border border-border rounded-lg hover:bg-muted transition-smooth text-sm font-medium text-foreground"
      >
        Reset Filters
      </button>
    </div>
  )
}
