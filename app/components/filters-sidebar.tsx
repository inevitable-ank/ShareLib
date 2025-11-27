"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

const categories = [
  { name: "Books", count: 124 },
  { name: "Tools", count: 89 },
  { name: "Electronics", count: 67 },
  { name: "Appliances", count: 45 },
  { name: "Sports Equipment", count: 56 },
  { name: "Furniture", count: 33 },
]

const conditions = ["New", "Good", "Used", "Damaged"]

export default function FiltersSidebar() {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    condition: true,
    distance: true,
    rating: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
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
            {categories.map((cat) => (
              <label
                key={cat.name}
                className="flex items-center gap-3 cursor-pointer hover:text-primary transition-smooth"
              >
                <input type="checkbox" className="w-4 h-4 rounded border-border" />
                <span className="text-sm text-muted-foreground flex-1">{cat.name}</span>
                <span className="text-xs text-muted-foreground/70">({cat.count})</span>
              </label>
            ))}
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
            {conditions.map((condition) => (
              <label
                key={condition}
                className="flex items-center gap-3 cursor-pointer hover:text-primary transition-smooth"
              >
                <input type="checkbox" className="w-4 h-4 rounded border-border" defaultChecked />
                <span className="text-sm text-muted-foreground">{condition}</span>
              </label>
            ))}
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
                <input type="checkbox" className="w-4 h-4 rounded border-border" />
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
                <input type="checkbox" className="w-4 h-4 rounded border-border" />
                <span className="text-sm text-muted-foreground">{rating}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset Filters */}
      <button className="w-full py-2 border border-border rounded-lg hover:bg-muted transition-smooth text-sm font-medium text-foreground">
        Reset Filters
      </button>
    </div>
  )
}
