import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, ArrowLeft } from "lucide-react"

const featuredItems = [
  {
    id: "1",
    title: "فستان سهرة ذهبي",
    price: 85,
    type: "sale" as const,
    image: "/images/listing-1.jpg",
    seller: {
      name: "سارة",
      rating: 4.9,
    },
    isFeatured: true,
  },
  {
    id: "2",
    title: "حقيبة شانيل كلاسيك",
    price: 450,
    type: "sale" as const,
    image: "/images/listing-2.jpg",
    seller: {
      name: "نورة",
      rating: 5.0,
    },
    isFeatured: false,
  },
  {
    id: "3",
    title: "عباية مطرزة فاخرة",
    price: 25,
    type: "sale" as const,
    image: "/images/listing-3.jpg",
    seller: {
      name: "دلال",
      rating: 4.8,
    },
    isFeatured: true,
  },
  {
    id: "4",
    title: "فستان زفاف إيلي صعب",
    price: 120,
    type: "sale" as const,
    image: "/images/listing-4.jpg",
    seller: {
      name: "منى",
      rating: 4.9,
    },
    isFeatured: false,
  },
]

export function FeaturedListings() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              أحدث الإعلانات
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              اكتشفي أحدث القطع المضافة من بائعاتنا الموثوقات
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/listings">
              عرض الكل
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredItems.map((item) => (
            <Link key={item.id} href={`/listings/${item.id}`}>
              <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Badge className="bg-primary text-primary-foreground">
                      للبيع
                    </Badge>
                    {item.isFeatured && (
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        مميز
                      </Badge>
                    )}
                  </div>

                  {/* Save Button */}
                  <button
                    className="absolute top-3 left-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    aria-label="حفظ"
                  >
                    <Heart className="h-4 w-4 text-foreground" />
                  </button>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {item.seller.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {item.seller.rating}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-lg font-bold text-primary">
                    {item.price} د.ك
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
