"use client"

import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Wallet, 
  Clock, 
  ShoppingBag, 
  Star,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  ArrowLeft
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const stats = [
  {
    title: "إجمالي الأرباح",
    value: "1,250 د.ك",
    icon: Wallet,
    change: "+12%",
    trend: "up",
  },
  {
    title: "المدفوعات المعلقة",
    value: "85 د.ك",
    icon: Clock,
    description: "3 معاملات",
  },
  {
    title: "الإعلانات النشطة",
    value: "12",
    icon: ShoppingBag,
    description: "من 15 إعلان",
  },
  {
    title: "تقييمك",
    value: "4.9",
    icon: Star,
    description: "47 تقييم",
  },
]

const myListings = [
  {
    id: "1",
    title: "فستان سهرة ذهبي",
    image: "/images/listing-1.jpg",
    price: 85,
    type: "rent",
    status: "active",
    views: 234,
    inquiries: 8,
  },
  {
    id: "2",
    title: "حقيبة شانيل كلاسيك",
    image: "/images/listing-2.jpg",
    price: 450,
    type: "sale",
    status: "active",
    views: 156,
    inquiries: 5,
  },
  {
    id: "3",
    title: "عباية مطرزة فاخرة",
    image: "/images/listing-3.jpg",
    price: 25,
    type: "rent",
    status: "rented",
    views: 89,
    inquiries: 3,
  },
]

const recentBookings = [
  {
    id: "b1",
    listing: "فستان سهرة ذهبي",
    customer: "نورة الصباح",
    dates: "15-18 مارس",
    amount: 255,
    status: "confirmed",
  },
  {
    id: "b2",
    listing: "عباية مطرزة فاخرة",
    customer: "سارة العلي",
    dates: "20-22 مارس",
    amount: 75,
    status: "pending",
  },
  {
    id: "b3",
    listing: "فستان سهرة ذهبي",
    customer: "منى الراشد",
    dates: "1-3 أبريل",
    amount: 255,
    status: "pending",
  },
]

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "نشط", variant: "default" },
  rented: { label: "مؤجر", variant: "secondary" },
  sold: { label: "مباع", variant: "outline" },
  paused: { label: "متوقف", variant: "outline" },
  confirmed: { label: "مؤكد", variant: "default" },
  pending: { label: "معلق", variant: "secondary" },
  completed: { label: "مكتمل", variant: "outline" },
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
              <p className="text-muted-foreground mt-1">مرحباً سارة، هذه نظرة عامة على حسابك</p>
            </div>
            <Button asChild>
              <Link href="/listings/new">
                <Plus className="h-4 w-4 ml-2" />
                إضافة قطعة جديدة
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    {stat.change && (
                      <Badge variant="secondary" className="bg-olive/10 text-olive">
                        <TrendingUp className="h-3 w-3 ml-1" />
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.title}
                  </p>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="listings">إعلاناتي</TabsTrigger>
              <TabsTrigger value="bookings">حجوزاتي</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>آخر الحجوزات</CardTitle>
                      <CardDescription>الحجوزات الأخيرة على قطعك</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/bookings">
                        عرض الكل
                        <ArrowLeft className="h-4 w-4 mr-1" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentBookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                        >
                          <div>
                            <p className="font-medium">{booking.listing}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.customer} • {booking.dates}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-primary">{booking.amount} د.ك</p>
                            <Badge variant={statusLabels[booking.status].variant}>
                              {statusLabels[booking.status].label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>إجراءات سريعة</CardTitle>
                    <CardDescription>الوصول السريع للمهام الشائعة</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/listings/new">
                        <Plus className="h-4 w-4 ml-3" />
                        إضافة قطعة جديدة
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/dashboard/earnings">
                        <Wallet className="h-4 w-4 ml-3" />
                        تقرير الأرباح
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/messages">
                        <Edit className="h-4 w-4 ml-3" />
                        الرسائل
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Listings Tab */}
            <TabsContent value="listings">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>إعلاناتي</CardTitle>
                    <CardDescription>جميع القطع التي أضفتها</CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/listings/new">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة قطعة
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex items-center gap-4 p-4 rounded-lg border"
                      >
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image
                            src={listing.image}
                            alt={listing.title}
                            width={64}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{listing.title}</h3>
                            <Badge variant={statusLabels[listing.status].variant}>
                              {statusLabels[listing.status].label}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-primary mt-1">
                            {listing.price} د.ك
                            {listing.type === "rent" && (
                              <span className="text-sm font-normal text-muted-foreground">/يوم</span>
                            )}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {listing.views} مشاهدة
                            </span>
                            <span>{listing.inquiries} استفسار</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 ml-2" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>حجوزاتي</CardTitle>
                  <CardDescription>جميع الحجوزات على قطعك</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>القطعة</TableHead>
                        <TableHead>العميلة</TableHead>
                        <TableHead>التواريخ</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.listing}</TableCell>
                          <TableCell>{booking.customer}</TableCell>
                          <TableCell>{booking.dates}</TableCell>
                          <TableCell className="font-bold text-primary">{booking.amount} د.ك</TableCell>
                          <TableCell>
                            <Badge variant={statusLabels[booking.status].variant}>
                              {statusLabels[booking.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/bookings/${booking.id}`}>
                                التفاصيل
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
