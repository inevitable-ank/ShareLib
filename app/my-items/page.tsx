"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import ItemCard from "@/app/components/item-card"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function MyItemsPage() {
  const [items, setItems] = useState([
    {
      id: "1",
      title: "Drill Machine - Professional Grade",
      category: "Tools",
      image: "/drill-machine.png",
      condition: "Good" as const,
      ownerName: "You",
      ownerRating: 4.8,
      location: "Downtown",
      distance: "Your location",
      requestCount: 3,
      borrowCount: 5,
    },
    {
      id: "2",
      title: "Pressure Washer 3000 PSI",
      category: "Tools",
      image: "/pressure-washer.png",
      condition: "New" as const,
      ownerName: "You",
      ownerRating: 4.8,
      location: "Downtown",
      distance: "Your location",
      requestCount: 1,
      borrowCount: 2,
    },
    {
      id: "3",
      title: "Mountain Bike XC Edition",
      category: "Sports Equipment",
      image: "/mountain-bike-trail.png",
      condition: "Good" as const,
      ownerName: "You",
      ownerRating: 4.8,
      location: "Downtown",
      distance: "Your location",
      requestCount: 4,
      borrowCount: 3,
    },
  ])

  const [activeTab, setActiveTab] = useState<"all" | "available" | "borrowed">("all")

  const filteredItems = items.filter((item) => {
    if (activeTab === "available") return true
    if (activeTab === "borrowed") return false
    return true
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Items</h1>
              <p className="text-muted-foreground">Manage items you're willing to lend</p>
            </div>
            <Link
              href="#"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg hover-lift font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add New Item
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-3xl font-bold text-foreground">{items.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Items</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-3xl font-bold text-accent">
                {items.reduce((sum, item) => sum + item.requestCount, 0)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Pending Requests</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-3xl font-bold text-secondary">
                {items.reduce((sum, item) => sum + item.borrowCount, 0)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Times Borrowed</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            {["all", "available", "borrowed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-3 font-semibold border-b-2 transition-smooth ${
                  activeTab === tab
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredItems.map((item) => (
              <div key={item.id} className="group">
                <div className="relative">
                  <ItemCard {...item} />
                  {/* Action Buttons */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-smooth rounded-xl flex items-center justify-center gap-3">
                    <button className="p-3 bg-white rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-smooth flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-smooth flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white rounded-lg text-foreground hover:bg-destructive hover:text-destructive-foreground transition-smooth flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Item Stats */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pending Requests</span>
                    <span className="font-semibold text-accent">{item.requestCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Times Borrowed</span>
                    <span className="font-semibold text-secondary">{item.borrowCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No items yet</h3>
              <p className="text-muted-foreground mb-6">Start sharing with your community by adding your first item</p>
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover-lift font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
