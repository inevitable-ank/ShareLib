"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import RatingDisplay from "@/components/rating-display"
import BorrowRequestModal from "@/components/borrow-request-modal"
import { MapPin, Calendar, Shield, Heart, Share2, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Mock data
  const images = ["/drill-machine.png", "/drill-machine-professional.jpg", "/power-tools-workshop.jpg"]

  const item = {
    id: params.id,
    title: "Drill Machine - Professional Grade",
    category: "Tools",
    condition: "Good",
    price: "Free to borrow",
    owner: {
      name: "John Smith",
      rating: 4.8,
      reviews: 24,
      joinedDate: "Jan 2023",
      location: "Downtown",
      avatar: "👤",
    },
    description:
      "High-powered drill machine perfect for home improvement projects. Comes with complete set of drill bits and carrying case. Well maintained and in excellent working condition.",
    specifications: {
      condition: "Good",
      maxDuration: "14 days",
      location: "Downtown, San Francisco",
      available: true,
      requestsPending: 3,
    },
    availability: {
      available: true,
      nextAvailable: "Immediately",
    },
  }

  const reviews = [
    {
      id: "1",
      author: "Alex Johnson",
      rating: 5,
      date: "2 weeks ago",
      comment: "Great tool, works perfectly! John was very communicative.",
    },
    {
      id: "2",
      author: "Sarah Williams",
      rating: 4,
      date: "1 month ago",
      comment: "Very satisfied with the condition. Would borrow again.",
    },
  ]

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
            <span className="text-foreground">{item.title}</span>
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
                    alt={`${item.title} - Image ${currentImageIndex + 1}`}
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
                  {images.map((img, idx) => (
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
                  <p className="text-muted-foreground leading-relaxed mb-6">{item.description}</p>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Condition</p>
                      <p className="font-semibold text-foreground">{item.specifications.condition}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Max Duration</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {item.specifications.maxDuration}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Location</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {item.specifications.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Status</p>
                      <p className="font-semibold text-accent">Available</p>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-bold text-lg text-foreground mb-4">Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="pb-4 border-b border-border last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-foreground">{review.author}</p>
                            <p className="text-sm text-muted-foreground">{review.date}</p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? "⭐" : "☆"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
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
                      <p className="text-xs text-accent font-semibold uppercase mb-2">{item.category}</p>
                      <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
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
                      {item.owner.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{item.owner.name}</p>
                      <RatingDisplay rating={item.owner.rating} count={item.owner.reviews} size="sm" />
                      <p className="text-xs text-muted-foreground mt-2">Joined {item.owner.joinedDate}</p>
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
      <BorrowRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        itemTitle={item.title}
        itemId={item.id}
      />

      <Footer />
    </>
  )
}
