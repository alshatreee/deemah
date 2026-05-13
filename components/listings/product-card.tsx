"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star } from "lucide-react"

export interface ProductCardProps {
  id: string
  title: string
  price: number
  type: "sale"
  image: string
  seller: {
    name: string
    rating: number
  }
  condition?: string
  size?: string
  isFeatured?: boolean
  isSaved?: boolean
}

export function ProductCard({
  id,
  title,
  price,
  image,
  seller,
  condition,
  size,
  isFeatured,
  isSaved,
}: ProductCardProps) {
  return (
    <Link href={`/listings/${id}`}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Badge className="bg-primary text-primary-foreground">
              للبيع
            </Badge>
            {isFeatured && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                مميز
              </Badge>
            )}
          </div>

          {/* Save Button */}
          <button
            className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isSaved
                ? "bg-primary text-primary-foreground"
                : "bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-white text-foreground"
            }`}
            aria-label={isSaved ? "إزالة من المحفوظات" : "حفظ"}
            onClick={(e) => {
              e.preventDefault()
              // Handle save logic
            }}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </button>

          {/* Quick Info Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
            <div className="flex items-center gap-2 text-white text-sm">
              {size && <span className="bg-white/20 px-2 py-0.5 rounded">{size}</span>}
              {condition && <span className="bg-white/20 px-2 py-0.5 rounded">{condition}</span>}
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {seller.name}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="text-xs text-muted-foreground">
                {seller.rating}
              </span>
            </div>
          </div>

          <p className="mt-2 text-lg font-bold text-primary">
            {price} د.ك
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
