import { Star } from "lucide-react"

interface RatingDisplayProps {
  rating: number
  count: number
  size?: "sm" | "md" | "lg"
}

export default function RatingDisplay({ rating, count, size = "md" }: RatingDisplayProps) {
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizes[size]} ${i < Math.floor(rating) ? "fill-secondary text-secondary" : "text-muted"}`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
      <span className="text-sm text-muted-foreground">({count} reviews)</span>
    </div>
  )
}
