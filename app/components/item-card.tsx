"use client"

import { Star, MapPin, Heart } from "lucide-react"
import Link from "next/link"

interface ItemCardProps {
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
  onFavoriteToggle?: (e: React.MouseEvent) => void
}

export default function ItemCard({
  id,
  title,
  category,
  image,
  condition,
  ownerName,
  ownerRating,
  location,
  distance,
  isFavorite = false,
  onFavoriteToggle,
}: ItemCardProps) {
  const conditionColors = {
    New: "bg-accent/20 text-accent",
    Good: "bg-primary/20 text-primary",
    Used: "bg-secondary/20 text-secondary",
    Damaged: "bg-destructive/20 text-destructive",
  }

  return (
    <Link href={`/items/${id}`}>
      <div className="bg-card rounded-xl overflow-hidden border border-border group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        {/* Image Container */}
        <div className="relative bg-muted h-48 overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
          />
          <div className="absolute top-3 right-3">
            <button
              className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                isFavorite ? "bg-accent/80 text-accent-foreground" : "bg-black/20 text-white hover:bg-black/40"
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onFavoriteToggle?.(e)
              }}
            >
              <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${conditionColors[condition]}`}
          >
            {condition}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title & Category */}
          <div className="mb-3">
            <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-1">{category}</p>
            <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-all duration-300">
              {title}
            </h3>
          </div>

          {/* Owner & Rating */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-xs font-bold text-white">
              {ownerName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{ownerName}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-secondary text-secondary" />
                <span className="text-xs text-muted-foreground">{ownerRating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Location & Distance */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
            {distance && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="flex-shrink-0">{distance}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
