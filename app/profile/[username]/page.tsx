"use client"

import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/listings/product-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Clock,
  ShoppingBag,
  BadgeCheck
} from "lucide-react"

// Mock data
const profile = {
  username: "sarah-alkhaled",
  name: "سارة الخالد",
  avatar: "/images/avatar-1.jpg",
  location: "السالمية، الكويت",
  joinedDate: "يناير 2024",
  bio: "محبة للأزياء الفاخرة والموضة. أشارك قطعي المفضلة مع من يقدّرها.",
  rating: 4.9,
  reviewCount: 47,
  responseTime: "خلال ساعة",
  listingsCount: 23,
  salesCount: 89,
  isVerified: true,
}

const listings = [
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
    seller: { name: "سارة", rating: 5.0 },
    condition: "جديد",
  },
  {
    id: "3",
    title: "عباية مطرزة فاخرة",
    price: 25,
    type: "rent" as const,
    image: "/images/listing-3.jpg",
    seller: { name: "سارة", rating: 4.8 },
    condition: "ممتاز",
    size: "L",
  },
  {
    id: "4",
    title: "فستان زفاف إيلي صعب",
    price: 120,
    type: "rent" as const,
    image: "/images/listing-4.jpg",
    seller: { name: "سارة", rating: 4.9 },
    condition: "ممتاز",
    size: "S",
  },
]

const reviews = [
  {
    id: "r1",
    author: "نورة الصباح",
    avatar: "/images/avatar-2.jpg",
    rating: 5,
    comment: "تجربة ممتازة! سارة متعاونة جداً والقطعة كانت مطابقة تماماً للصور. أنصح بالتعامل معها.",
    date: "منذ أسبوع",
    listing: "فستان سهرة ذهبي",
  },
  {
    id: "r2",
    author: "منى الراشد",
    avatar: "/images/avatar-3.jpg",
    rating: 5,
    comment: "سرعة في الرد وجودة عالية في القطع. شكراً سارة!",
    date: "منذ أسبوعين",
    listing: "عباية مطرزة فاخرة",
  },
  {
    id: "r3",
    author: "هند المطيري",
    avatar: "/images/avatar-4.jpg",
    rating: 4,
    comment: "القطعة جميلة والتواصل كان سهل. فقط التسليم تأخر قليلاً.",
    date: "منذ شهر",
    listing: "حقيبة شانيل كلاسيك",
  },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-card rounded-2xl border p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start">
                <div className="relative">
                  <Avatar className="w-28 h-28 md:w-36 md:h-36">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-3xl">{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {profile.isVerified && (
                    <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-right">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
                  <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
                  {profile.isVerified && (
                    <Badge className="w-fit mx-auto md:mx-0 bg-olive text-olive-foreground">
                      <BadgeCheck className="h-3 w-3 ml-1" />
                      موثقة
                    </Badge>
                  )}
                </div>

                <p className="mt-3 text-muted-foreground max-w-xl">{profile.bio}</p>

                <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    انضمت {profile.joinedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    ترد {profile.responseTime}
                  </span>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center gap-6 mt-6 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-primary text-primary" />
                      <span className="text-xl font-bold">{profile.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{profile.reviewCount} تقييم</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center">
                    <p className="text-xl font-bold">{profile.listingsCount}</p>
                    <p className="text-xs text-muted-foreground">إعلان</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center">
                    <p className="text-xl font-bold">{profile.salesCount}</p>
                    <p className="text-xs text-muted-foreground">عملية بيع</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <Button size="lg">
                    <MessageCircle className="h-5 w-5 ml-2" />
                    راسليها
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="listings">
            <TabsList className="mb-6">
              <TabsTrigger value="listings" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                إعلاناتها ({listings.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <Star className="h-4 w-4" />
                التقييمات ({reviews.length})
              </TabsTrigger>
            </TabsList>

            {/* Listings Tab */}
            <TabsContent value="listings">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {listings.map((listing) => (
                  <ProductCard key={listing.id} {...listing} />
                ))}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <div className="max-w-2xl space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={review.avatar} alt={review.author} />
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{review.author}</p>
                            <p className="text-sm text-muted-foreground">{review.listing}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        
                        <p className="mt-3 text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
