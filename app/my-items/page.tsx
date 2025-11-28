"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import ItemCard from "@/app/components/item-card"
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProfile, useItems, useBorrowRequests, useBorrowRecords } from "@/app/lib/queries"

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
  requestCount: number
  borrowCount: number
  isAvailable: boolean
  isBorrowed: boolean
}

export default function MyItemsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"all" | "available" | "borrowed">("all")

  // Fetch user profile to get user ID
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile()
  
  // Redirect to login if session expired
  useEffect(() => {
    if (profileError) {
      const errorMessage = profileError instanceof Error ? profileError.message : String(profileError)
      if (errorMessage.includes('Session expired') || errorMessage.includes('token') || errorMessage.includes('401')) {
        const timer = setTimeout(() => {
          router.push('/login')
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [profileError, router])

  const profileId = profile && typeof profile === 'object' ? (profile as any).id : undefined

  // Fetch items owned by the user
  const { data: itemsData, isLoading: itemsLoading } = useItems(
    profileId ? { owner: profileId } : undefined
  )

  // Fetch borrow requests to count pending requests per item (only for items I own)
  const { data: borrowRequestsData } = useBorrowRequests({ lender: 'me' })

  // Fetch borrow records to count borrows per item (only for items I own)
  const { data: borrowRecordsData } = useBorrowRecords({ owner: 'me' })

  // Transform API data to match ItemCard format
  const items = useMemo<TransformedItem[]>(() => {
    if (!itemsData) return []

    // Handle paginated response or array
    const itemsArray = Array.isArray((itemsData as any).results)
      ? (itemsData as any).results
      : Array.isArray(itemsData)
      ? itemsData
      : []

    // Get borrow requests array
    const requestsArray = borrowRequestsData
      ? Array.isArray((borrowRequestsData as any).results)
        ? (borrowRequestsData as any).results
        : Array.isArray(borrowRequestsData)
        ? borrowRequestsData
        : []
      : []

    // Get borrow records array
    const recordsArray = borrowRecordsData
      ? Array.isArray((borrowRecordsData as any).results)
        ? (borrowRecordsData as any).results
        : Array.isArray(borrowRecordsData)
        ? borrowRecordsData
        : []
      : []

    return itemsArray.map((item: any) => {
      // Get first image or placeholder
      // Backend now returns photos as array of absolute URLs: ["http://..."]
      let image = "/placeholder.svg"
      if (item.photos && Array.isArray(item.photos) && item.photos.length > 0) {
        // Photos is now an array of absolute URLs
        image = item.photos[0] || "/placeholder.svg"
      } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        // Fallback to images field (same as photos)
        image = item.images[0] || "/placeholder.svg"
      } else if (item.photos && typeof item.photos === 'string') {
        // Handle legacy string format if still present
        image = item.photos
      }

      // Get category name
      const categoryName = item.category?.name || item.category || "Uncategorized"

      // Normalize condition to match ItemCard type
      const conditionMap: Record<string, "New" | "Good" | "Used" | "Damaged"> = {
        new: "New",
        good: "Good",
        used: "Used",
        damaged: "Damaged",
      }
      const condition = conditionMap[item.condition?.toLowerCase()] || "Good"

      // Get owner name
      const owner = item.owner || {}
      const ownerName =
        owner.first_name || owner.last_name
          ? `${owner.first_name || ""} ${owner.last_name || ""}`.trim()
          : owner.username || owner.full_name || "You"

      // Get owner rating (prefer lender_rating, fallback to average)
      const ownerRating = parseFloat(
        owner.lender_rating || owner.rating || "0"
      ) || 0

      // Count pending requests for this item
      // Backend now filters by lender=me, so all requests are for items we own
      // Handle both item as object (with id) and item as number (id only)
      const requestCount = requestsArray.filter((req: any) => {
        const requestItemId = typeof req.item === 'object' ? req.item?.id : req.item
        return requestItemId === item.id && req.status === "pending"
      }).length

      // Count completed borrows for this item
      // Handle both request.item as object and as number
      const borrowCount = recordsArray.filter((record: any) => {
        const recordItemId = record.request?.item
          ? typeof record.request.item === 'object'
            ? record.request.item?.id
            : record.request.item
          : record.item?.id || record.item
        return recordItemId === item.id &&
          (record.status === "borrowed" || record.status === "returned")
      }).length

      // Check if item is currently borrowed
      const isBorrowed = recordsArray.some((record: any) => {
        const recordItemId = record.request?.item
          ? typeof record.request.item === 'object'
            ? record.request.item?.id
            : record.request.item
          : record.item?.id || record.item
        return recordItemId === item.id && record.status === "borrowed"
      })

      return {
        id: String(item.id),
        title: item.title || "Untitled Item",
        category: categoryName,
        image: image,
        condition: condition,
        ownerName: ownerName,
        ownerRating: ownerRating,
        location: item.location || owner.location || "Location not specified",
        distance: "Your location",
        requestCount: requestCount,
        borrowCount: borrowCount,
        isAvailable: item.is_available !== false,
        isBorrowed: isBorrowed,
      }
    })
  }, [itemsData, borrowRequestsData, borrowRecordsData])

  // Filter items based on active tab
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === "available") return item.isAvailable && !item.isBorrowed
      if (activeTab === "borrowed") return item.isBorrowed
      return true // "all" tab
    })
  }, [items, activeTab])

  const isLoading = profileLoading || itemsLoading

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalItems: items.length,
      pendingRequests: items.reduce((sum, item) => sum + item.requestCount, 0),
      timesBorrowed: items.reduce((sum, item) => sum + item.borrowCount, 0),
    }
  }, [items])

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

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
              <div className="text-3xl font-bold text-foreground">{stats.totalItems}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Items</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-3xl font-bold text-accent">
                {stats.pendingRequests}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Pending Requests</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-3xl font-bold text-secondary">
                {stats.timesBorrowed}
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
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredItems.map((item) => (
                <div key={item.id} className="group">
                  <div className="relative">
                    <ItemCard {...item} />
                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-smooth rounded-xl flex items-center justify-center gap-3">
                      <Link
                        href={`/items/${item.id}`}
                        className="p-3 bg-white rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-smooth flex items-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
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
          ) : (
            /* Empty State */
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
