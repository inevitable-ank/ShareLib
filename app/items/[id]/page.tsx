"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import RatingDisplay from "@/app/components/rating-display"
import BorrowRequestModal from "@/app/components/borrow-request-modal"
import { MapPin, Calendar, Shield, Heart, Share2, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react"
import { useState, use } from "react"
import Link from "next/link"
import { useItem, useItemRatings, useUser } from "@/app/lib/queries"

interface Item {
  id: number
  title: string
  description: string
  category: { id: number; name: string; description: string }
  condition: string
  photos: string | string[]
  status: string
  location?: string
  owner: { id: number; username: string; email: string; first_name?: string; last_name?: string; avatar?: string; location?: string; lender_rating?: string; borrower_rating?: string }
  created_at: string
  updated_at: string
}

interface Review {
  id: number
  from_user: string
  to_user: string
  item: number
  stars: number
  message?: string
  created_at: string
}

interface Owner {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  avatar?: string
  location?: string
  lender_rating?: string
  borrower_rating?: string
}

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params)
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Fetch data with TanStack Query
  const {
    data: item,
    isLoading: itemLoading,
    error: itemError,
  } = useItem(id)
  const itemData = item as Item | undefined
  const { data: owner } = useUser(itemData?.owner?.id, {
    enabled: !!itemData?.owner?.id,
  })
  const { data: reviewsData } = useItemRatings(id)
  const reviews = (reviewsData || []) as Review[]

  const isLoading = itemLoading
  const error = itemError instanceof Error ? itemError.message : null
  const ownerData = owner as Owner | undefined

  // Get images array from item photos
  const images = itemData
    ? Array.isArray(itemData.photos)
      ? itemData.photos
      : itemData.photos
      ? [itemData.photos]
      : ["/placeholder.svg"]
    : ["/placeholder.svg"]

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // Get owner display name
  const getOwnerName = () => {
    if (!ownerData) return "Unknown"
    if (ownerData.first_name || ownerData.last_name) {
      return `${ownerData.first_name || ""} ${ownerData.last_name || ""}`.trim() || ownerData.username
    }
    return ownerData.username
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading item details...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !item) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "Item not found"}</p>
            <Link href="/browse" className="text-primary hover:underline">
              Back to Browse
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/browse" className="hover:text-foreground transition-all duration-300">
              Browse
            </Link>
            <span>/</span>
            <span className="text-foreground">{itemData?.title || "Item"}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-muted rounded-xl overflow-hidden h-96 lg:h-[500px]">
                    <img
                    src={images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${itemData?.title || "Item"} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Image Navigation */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all duration-300"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all duration-300"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${
                      isFavorite ? "bg-accent text-accent-foreground" : "bg-white/80 hover:bg-white text-foreground"
                    }`}
                  >
                    <Heart className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-3">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        currentImageIndex === idx ? "border-primary" : "border-border"
                      }`}
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Description */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-bold text-lg text-foreground mb-4">About This Item</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{itemData?.description || ""}</p>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Condition</p>
                      <p className="font-semibold text-foreground capitalize">{itemData?.condition || ""}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Status</p>
                      <p className="font-semibold text-accent capitalize">{itemData?.status || ""}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Location</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {itemData?.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-bold text-lg text-foreground mb-4">
                    Reviews ({reviews.length})
                  </h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="pb-4 border-b border-border last:border-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-foreground">{review.from_user}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(review.created_at)}</p>
                            </div>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.stars ? "⭐" : "☆"} />
                              ))}
                            </div>
                          </div>
                          {review.message && <p className="text-muted-foreground">{review.message}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this item!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                {/* Item Header */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      <p className="text-xs text-accent font-semibold uppercase mb-2">
                        {itemData?.category?.name || "Uncategorized"}
                      </p>
                      <h1 className="text-2xl font-bold text-foreground">{itemData?.title || ""}</h1>
                    </div>
                  </div>

                  <button className="w-full py-2 text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center justify-center gap-2 mb-4">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                {/* Owner Card */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Lender</h3>
                  <div className="flex items-start gap-4 pb-4 border-b border-border">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                      {ownerData?.avatar || itemData?.owner?.avatar || "👤"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{getOwnerName()}</p>
                      {ownerData && (
                        <>
                          <RatingDisplay
                            rating={parseFloat(ownerData.lender_rating || "0")}
                            count={0}
                            size="sm"
                          />
                          {ownerData.location && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {ownerData.location}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2 border border-border rounded-lg hover:bg-muted transition-all duration-300 font-medium text-foreground">
                    Contact Owner
                  </button>
                </div>

                {/* Availability */}
                <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl border border-accent/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-foreground">Availability</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    <span className="font-semibold text-accent">Available now</span> - Pick up immediately
                  </p>
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    Request to Borrow
                  </button>
                </div>

                {/* Trust & Safety */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Trust & Safety</h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-accent flex-shrink-0 mt-1">✓</span>
                      <span className="text-muted-foreground">Verified lender with 4.8 rating</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent flex-shrink-0 mt-1">✓</span>
                      <span className="text-muted-foreground">Member since Jan 2023</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent flex-shrink-0 mt-1">✓</span>
                      <span className="text-muted-foreground">Identity verified</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Borrow Request Modal */}
      {itemData && (
        <BorrowRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          itemTitle={itemData.title}
          itemId={itemData.id.toString()}
        />
      )}

      <Footer />
    </>
  )
}
