import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/listings/product-card"
import { ArrowLeft } from "lucide-react"

const featuredItems = [
  {
    id: "1",
    title: "فستان سهرة ذهبي",
    price: 85,
    type: "rent" as const,
    image: "/images/listing-1.jpg",
    seller: { name: "سارة", rating: 4.9 },
    isFeatured: true,
    colors: [
      { name: "ذهبي", hex: "#d4af37" },
      { name: "أسود", hex: "#1a1a1a" },
      { name: "عاجي", hex: "#fffff0" },
    ],
  },
  {
    id: "2",
    title: "حقيبة شانيل كلاسيك",
    price: 450,
    type: "sale" as const,
    image: "/images/listing-2.jpg",
    seller: { name: "نورة", rating: 5.0 },
    isFeatured: false,
    colors: [
      { name: "أسود", hex: "#1a1a1a" },
      { name: "بيج", hex: "#c8a882" },
    ],
  },
  {
    id: "3",
    title: "عباية مطرزة فاخرة",
    price: 25,
    type: "rent" as const,
    image: "/images/listing-3.jpg",
    seller: { name: "دلال", rating: 4.8 },
    isFeatured: true,
    colors: [
      { name: "كحلي", hex: "#1e2952" },
      { name: "عنابي", hex: "#722f37" },
      { name: "أخضر", hex: "#3d5a3d" },
      { name: "أسود", hex: "#1a1a1a" },
    ],
  },
  {
    id: "4",
    title: "فستان زفاف إيلي صعب",
    price: 120,
    type: "rent" as const,
    image: "/images/listing-4.jpg",
    seller: { name: "منى", rating: 4.9 },
    isFeatured: false,
    colors: [
      { name: "أبيض", hex: "#ffffff" },
      { name: "شامبانيا", hex: "#f7e7ce" },
    ],
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
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
