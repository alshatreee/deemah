"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, ShieldCheck } from "lucide-react"
import { ConditionBadge } from "./condition-badge"
import { brandLabel } from "@/lib/constants/brands"

export interface ProductCardProps {
  id: string
  title: string
  price: number
  originalPrice?: number | null
  type: "sale"
  image: string
  brand?: string | null
  seller: {
    name: string
    rating: number
    verified?: boolean
  }
  condition?: string | null
  size?: string | null
  authenticityVerified?: boolean
  isFeatured?: boolean
  isSaved?: boolean
}

function discountPct(orig: number, price: number): number | null {
  if (!orig || orig <= price) return null
  return Math.round(((orig - price) / orig) * 100)
}

export function ProductCard({
  id,
  title,
  price,
  originalPrice,
  image,
  brand,
  seller,
  condition,
  size,
  authenticityVerified,
  isFeatured,
  isSaved,
}: ProductCardProps) {
  const discount = originalPrice ? discountPct(originalPrice, price) : null
  const displayBrand = brand ? brandLabel(brand) : null

  return (
    <Link href={`/listings/${id}`} className="block">
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top-right badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {discount !== null && discount > 0 && (
              <Badge className="bg-red-600 hover:bg-red-600 text-white text-xs px-2 py-1 shadow">
                {discount}% خصم
              </Badge>
            )}
            {isFeatured && (
              <Badge className="bg-accent text-accent-foreground text-[10px]">
                مميّز
              </Badge>
            )}
            <ConditionBadge condition={condition} />
          </div>

          {/* Top-left badges (authenticity / save) */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
            {authenticityVerified && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600/95 text-white px-2 py-0.5 text-[10px] font-medium shadow"
                title="تم التحقق من الأصالة"
              >
                <ShieldCheck className="h-3 w-3" />
                أصلية
              </span>
            )}
            <button
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isSaved
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-white text-foreground"
              }`}
              aria-label={isSaved ? "إزالة من المحفوظات" : "حفظ"}
              onClick={(e) => {
                e.preventDefault()
              }}
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Quick Info Overlay */}
          {(size || condition) && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
              <div className="flex items-center gap-2 text-white text-sm">
                {size && <span className="bg-white/20 px-2 py-0.5 rounded">{size}</span>}
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {displayBrand && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {displayBrand}
            </p>
          )}
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-sm">
            {title}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground line-clamp-1">{seller.name}</span>
            {seller.verified && (
              <ShieldCheck className="h-3 w-3 text-blue-500 shrink-0" aria-label="بائعة موثّقة" />
            )}
            <div className="flex items-center gap-0.5 ms-auto">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="text-muted-foreground">{seller.rating}</span>
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{price} د.ك</span>
            {originalPrice && discount !== null && (
              <span className="text-xs text-muted-foreground line-through">
                {originalPrice} د.ك
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
