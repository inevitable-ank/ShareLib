"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import ItemCard from "@/app/components/item-card"
import FiltersSidebar from "@/app/components/filters-sidebar"
import { LayoutGrid, List, ChevronDown } from "lucide-react"
import { useState } from "react"

const mockItems = [
  {
    id: "1",
    title: "Drill Machine - Professional Grade",
    category: "Tools",
    image: "/drill-machine.png",
    condition: "Good" as const,
    ownerName: "John Smith",
    ownerRating: 4.8,
    location: "Downtown",
    distance: "2.3 km",
  },
  {
    id: "2",
    title: "Mountain Bike XC Edition",
    category: "Sports Equipment",
    image: "/mountain-bike-trail.png",
    condition: "New" as const,
    ownerName: "Sarah Johnson",
    ownerRating: 4.9,
    location: "Riverside",
    distance: "4.1 km",
  },
  {
    id: "3",
    title: "Canon DSLR Camera Bundle",
    category: "Electronics",
    image: "/vintage-camera-still-life.png",
    condition: "Good" as const,
    ownerName: "Mike Chen",
    ownerRating: 4.7,
    location: "Midtown",
    distance: "1.8 km",
  },
  {
    id: "4",
    title: "Vintage Leather Sofa",
    category: "Furniture",
    image: "/brown-leather-sofa.png",
    condition: "Used" as const,
    ownerName: "Emma Davis",
    ownerRating: 4.6,
    location: "Uptown",
    distance: "3.2 km",
  },
  {
    id: "5",
    title: "Pressure Washer 3000 PSI",
    category: "Tools",
    image: "/pressure-washer.png",
    condition: "New" as const,
    ownerName: "Robert Wilson",
    ownerRating: 4.8,
    location: "Suburbs",
    distance: "5.7 km",
  },
  {
    id: "6",
    title: "Shakespeare Complete Works Set",
    category: "Books",
    image: "/books-collection.png",
    condition: "Good" as const,
    ownerName: "Lisa Anderson",
    ownerRating: 4.9,
    location: "Downtown",
    distance: "2.1 km",
  },
  {
    id: "7",
    title: "Air Fryer Pro Max",
    category: "Appliances",
    image: "/air-fryer-kitchen.jpg",
    condition: "New" as const,
    ownerName: "James Brown",
    ownerRating: 4.7,
    location: "Westside",
    distance: "3.8 km",
  },
  {
    id: "8",
    title: "Yoga Mat & Meditation Set",
    category: "Sports Equipment",
    image: "/yoga-mat-meditation.jpg",
    condition: "Good" as const,
    ownerName: "Rachel Green",
    ownerRating: 4.9,
    location: "Eastside",
    distance: "2.4 km",
  },
]

export default function BrowsePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("closest")

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
              Showing <span className="font-semibold text-foreground">{mockItems.length}</span> items
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-all duration-300 text-sm font-medium">
                  Sort: {sortBy === "closest" ? "Closest" : sortBy === "newest" ? "Newest" : "Rating"}
                  <ChevronDown className="w-4 h-4" />
                </button>
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
              <FiltersSidebar />
            </div>

            {/* Items Grid */}
            <div className="lg:col-span-3">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockItems.map((item) => (
                    <ItemCard key={item.id} {...item} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {mockItems.map((item) => (
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
                          {item.ownerName} • ⭐ {item.ownerRating}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.location} • {item.distance}
                        </p>
                      </div>
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
