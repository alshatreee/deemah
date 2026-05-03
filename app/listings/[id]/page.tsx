"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  Share2, 
  Star, 
  MessageCircle, 
  Shield, 
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Clock
} from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

// Mock data
const listing = {
  id: "1",
  title: "فستان سهرة ذهبي فاخر",
  description: "فستان سهرة أنيق بلون ذهبي لامع، مناسب للمناسبات الخاصة والحفلات. الفستان بحالة ممتازة، تم ارتداؤه مرة واحدة فقط. يأتي مع حزام مطابق.",
  price: 85,
  type: "rent" as const,
  images: [
    "/images/listing-1.jpg",
    "/images/listing-2.jpg",
    "/images/listing-3.jpg",
    "/images/listing-4.jpg",
  ],
  category: "فساتين",
  condition: "ممتاز",
  size: "M",
  brand: "زهير مراد",
  color: "ذهبي",
  minRentalDays: 2,
  seller: {
    id: "seller-1",
    name: "سارة الخالد",
    avatar: "/images/avatar-1.jpg",
    rating: 4.9,
    reviewCount: 47,
    responseTime: "خلال ساعة",
    location: "السالمية، الكويت",
    joinedDate: "يناير 2024",
    listingsCount: 23,
    salesCount: 89,
  },
  reviews: [
    {
      id: "r1",
      author: "نورة",
      rating: 5,
      comment: "فستان رائع جداً والبائعة متعاونة. شكراً!",
      date: "منذ أسبوع",
    },
    {
      id: "r2",
      author: "منى",
      rating: 5,
      comment: "القطعة مطابقة للصور تماماً. تجربة ممتازة",
      date: "منذ شهر",
    },
  ],
}

export default function ListingDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const isRental = listing.type === "rent"

  const calculateTotal = () => {
    if (!dateRange.from || !dateRange.to) return listing.price
    const days = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
    )
    return listing.price * Math.max(days, listing.minRentalDays)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">الرئيسية</Link>
              <ChevronLeft className="h-4 w-4" />
              <Link href="/listings" className="hover:text-primary">القطع</Link>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-foreground">{listing.title}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                <Image
                  src={listing.images[selectedImage]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Navigation Arrows */}
                <button
                  onClick={() => setSelectedImage((prev) => 
                    prev === 0 ? listing.images.length - 1 : prev - 1
                  )}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="الصورة السابقة"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => 
                    prev === listing.images.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="الصورة التالية"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Badges */}
                <div className="absolute top-4 right-4">
                  <Badge 
                    className={`${
                      isRental
                        ? "bg-olive text-olive-foreground" 
                        : "bg-primary text-primary-foreground"
                    } text-base px-4 py-1`}
                  >
                    {isRental ? "للإيجار" : "للبيع"}
                  </Badge>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative shrink-0 w-20 h-24 rounded-lg overflow-hidden ${
                      selectedImage === index 
                        ? "ring-2 ring-primary ring-offset-2" 
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`صورة ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Title & Actions */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {listing.title}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsSaved(!isSaved)}
                      className={isSaved ? "text-primary" : ""}
                    >
                      <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <p className="mt-4 text-3xl font-bold text-primary">
                  {listing.price} د.ك
                  {isRental && (
                    <span className="text-lg font-normal text-muted-foreground">/يوم</span>
                  )}
                </p>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {listing.category}
                </Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  مقاس {listing.size}
                </Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  حالة: {listing.condition}
                </Badge>
                {listing.brand && (
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {listing.brand}
                  </Badge>
                )}
              </div>

              {/* Description */}
              <div>
                <h2 className="font-semibold text-foreground mb-2">الوصف</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Date Picker for Rental */}
              {isRental && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      اختاري تاريخ الإيجار
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-right">
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "d MMM", { locale: ar })} -{" "}
                                {format(dateRange.to, "d MMM yyyy", { locale: ar })}
                              </>
                            ) : (
                              format(dateRange.from, "d MMM yyyy", { locale: ar })
                            )
                          ) : (
                            <span className="text-muted-foreground">اختاري التواريخ</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                          numberOfMonths={1}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>

                    {dateRange.from && dateRange.to && (
                      <div className="mt-4 p-4 bg-secondary rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>المجموع</span>
                          <span className="font-bold text-primary">{calculateTotal()} د.ك</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button size="lg" className="flex-1">
                  {isRental ? "احجزي الآن" : "اشتري الآن"}
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                  <MessageCircle className="h-5 w-5 ml-2" />
                  راسلي البائعة
                </Button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 p-4 bg-olive/10 rounded-xl">
                <Shield className="h-8 w-8 text-olive" />
                <div>
                  <p className="font-semibold text-foreground">معاملة آمنة</p>
                  <p className="text-sm text-muted-foreground">
                    دفع محمي ومضمون عبر المنصة
                  </p>
                </div>
              </div>

              {/* Seller Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={listing.seller.avatar} alt={listing.seller.name} />
                      <AvatarFallback>{listing.seller.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Link 
                        href={`/profile/${listing.seller.id}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {listing.seller.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">{listing.seller.rating}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          ({listing.seller.reviewCount} تقييم)
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.seller.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {listing.seller.responseTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{listing.seller.listingsCount}</p>
                      <p className="text-xs text-muted-foreground">إعلان</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{listing.seller.salesCount}</p>
                      <p className="text-xs text-muted-foreground">عملية بيع</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{listing.seller.joinedDate}</p>
                      <p className="text-xs text-muted-foreground">انضمت</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12">
            <Tabs defaultValue="reviews">
              <TabsList>
                <TabsTrigger value="reviews">التقييمات ({listing.reviews.length})</TabsTrigger>
                <TabsTrigger value="similar">قطع مشابهة</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6 max-w-2xl">
                  {listing.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.author}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "fill-primary text-primary"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="similar" className="mt-6">
                <p className="text-muted-foreground">قريباً...</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
