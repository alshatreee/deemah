"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/listings/product-card"
import { ListingsFilter } from "@/components/listings/listings-filter"
import { CategoryHero } from "@/components/listings/category-hero"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Grid3X3, LayoutGrid } from "lucide-react"

// Mock data - would come from API
const mockListings = [
  {
    id: "1",
    title: "فستان سهرة ذهبي",
    price: 85,
    type: "rent" as const,
    image: "/images/listing-1.jpg",
    seller: { name: "سارة", rating: 4.9 },
    condition: "ممتاز",
    size: "M",
    isFeatured: true,
  },
  {
    id: "2",
    title: "حقيبة شانيل كلاسيك",
    price: 450,
    type: "sale" as const,
    image: "/images/listing-2.jpg",
    seller: { name: "نورة", rating: 5.0 },
    condition: "جديد",
    isFeatured: false,
  },
  {
    id: "3",
    title: "عباية مطرزة فاخرة",
    price: 25,
    type: "rent" as const,
    image: "/images/listing-3.jpg",
    seller: { name: "دلال", rating: 4.8 },
    condition: "ممتاز",
    size: "L",
    isFeatured: true,
  },
  {
    id: "4",
    title: "فستان زفاف إيلي صعب",
    price: 120,
    type: "rent" as const,
    image: "/images/listing-4.jpg",
    seller: { name: "منى", rating: 4.9 },
    condition: "ممتاز",
    size: "S",
  },
  {
    id: "5",
    title: "فستان كوكتيل أسود",
    price: 65,
    type: "rent" as const,
    image: "/images/listing-1.jpg",
    seller: { name: "هند", rating: 4.7 },
    condition: "جيد",
    size: "M",
  },
  {
    id: "6",
    title: "طقم مجوهرات لؤلؤ",
    price: 280,
    type: "sale" as const,
    image: "/images/listing-2.jpg",
    seller: { name: "فاطمة", rating: 5.0 },
    condition: "جديد",
  },
  {
    id: "7",
    title: "عباية سوداء فاخرة",
    price: 30,
    type: "rent" as const,
    image: "/images/listing-3.jpg",
    seller: { name: "مريم", rating: 4.6 },
    condition: "ممتاز",
    size: "XL",
  },
  {
    id: "8",
    title: "حذاء لوبوتان أحمر",
    price: 320,
    type: "sale" as const,
    image: "/images/listing-4.jpg",
    seller: { name: "ريم", rating: 4.9 },
    condition: "جديد",
    size: "38",
  },
]

export default function ListingsPage() {
  const [activeCategory, setActiveCategory] = useState("women")
  const [sortBy, setSortBy] = useState("newest")
  const [gridCols, setGridCols] = useState<2 | 4>(4)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Banner per category */}
          {activeCategory === "women" ? (
            <CategoryHero
              image="/images/hero-fashion.jpg"
              imageAlt="فستان فاخر"
              titleLine1="اشتري وأجّري"
              titleLine2="أزياء فاخرة"
            />
          ) : (
            <CategoryHero
              // TODO: Replace with a real kids fashion image (e.g. /images/category-kids-hero.jpg)
              image="/images/category-kids.jpg"
              imageAlt="ملابس أطفال فاخرة"
              titleLine1="اشتري وأجّري"
              titleLine2="أزياء أطفال فاخرة"
            />
          )}

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              تصفحي القطع
            </h1>
            <p className="mt-2 text-muted-foreground">
              اكتشفي أحدث الأزياء الفاخرة من بائعاتنا الموثوقات
            </p>
          </div>

          {/* Category Tabs */}
          <div className="mb-6">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="women" className="text-base">
                  أزياء نسائية
                </TabsTrigger>
                <TabsTrigger value="kids" className="text-base">
                  ملابس أطفال
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <ListingsFilter />
              <p className="text-sm text-muted-foreground hidden sm:block">
                {mockListings.length} نتيجة
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price-low">الأرخص</SelectItem>
                  <SelectItem value="price-high">الأعلى سعراً</SelectItem>
                  <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                </SelectContent>
              </Select>

              {/* Grid Toggle - Desktop Only */}
              <div className="hidden md:flex items-center border rounded-lg">
                <Button
                  variant={gridCols === 4 ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setGridCols(4)}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={gridCols === 2 ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setGridCols(2)}
                  className="rounded-r-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex gap-8">
            {/* Desktop Sidebar Filter */}
            <ListingsFilter />

            {/* Products Grid */}
            <div className="flex-1">
              {activeCategory === "kids" && (
                <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-olive bg-olive/10 px-3 py-1.5 rounded-full">
                  <span>👧</span>
                  <span>قسم الأطفال — للبيع فقط</span>
                </div>
              )}
              <div
                className={`grid gap-4 md:gap-6 ${
                  activeCategory === "kids"
                    ? "grid-cols-2 md:grid-cols-3"
                    : gridCols === 4
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {mockListings.map((listing) => (
                  <ProductCard key={listing.id} {...listing} />
                ))}
              </div>

              {/* Load More */}
              <div className="mt-12 text-center">
                <Button variant="outline" size="lg">
                  تحميل المزيد
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
