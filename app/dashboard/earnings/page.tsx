"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Wallet,
  ShoppingBag,
  Tag,
  Clock,
  ChevronRight,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface Stat {
  title: string
  value: string
  icon: typeof Wallet
  change?: string
  trend?: "up" | "down"
  color: "primary" | "olive" | "muted"
  description?: string
}

const stats: Stat[] = [
  { title: "إجمالي الأرباح", value: "1,250 د.ك", icon: Wallet, change: "+12%", trend: "up", color: "primary" },
  { title: "إيرادات البيع", value: "850 د.ك", icon: ShoppingBag, change: "+8%", trend: "up", color: "primary" },
  { title: "إيرادات الإيجار", value: "400 د.ك", icon: Tag, change: "+18%", trend: "up", color: "olive" },
  { title: "المدفوعات المعلقة", value: "85 د.ك", icon: Clock, description: "3 معاملات", color: "muted" },
]

const chartData = [
  { month: "يناير", sales: 120, rentals: 45 },
  { month: "فبراير", sales: 180, rentals: 60 },
  { month: "مارس", sales: 150, rentals: 85 },
  { month: "أبريل", sales: 200, rentals: 70 },
  { month: "مايو", sales: 220, rentals: 95 },
  { month: "يونيو", sales: 280, rentals: 110 },
]

interface Transaction {
  id: string
  listing: string
  type: "sale" | "rental"
  date: string
  amount: number
  fee: number
  net: number
  status: "completed" | "pending"
}

const rawTransactions: Omit<Transaction, "net">[] = [
  { id: "t1", listing: "حقيبة شانيل كلاسيك", type: "sale", date: "15 يونيو 2024", amount: 450, fee: 36, status: "completed" },
  { id: "t2", listing: "فستان سهرة ذهبي", type: "rental", date: "12 يونيو 2024", amount: 255, fee: 28, status: "completed" },
  { id: "t3", listing: "عباية مطرزة فاخرة", type: "rental", date: "10 يونيو 2024", amount: 75, fee: 9, status: "pending" },
  { id: "t4", listing: "فستان سهرة ذهبي", type: "rental", date: "5 يونيو 2024", amount: 170, fee: 19, status: "completed" },
  { id: "t5", listing: "طقم مجوهرات لؤلؤ", type: "sale", date: "1 يونيو 2024", amount: 280, fee: 22, status: "completed" },
]

const transactions: Transaction[] = rawTransactions.map((t) => ({ ...t, net: t.amount - t.fee }))

const statusLabels: Record<Transaction["status"], { label: string; variant: "default" | "secondary" | "outline" }> = {
  completed: { label: "مكتمل", variant: "default" },
  pending: { label: "معلق", variant: "secondary" },
}

const chartConfig = {
  sales: { label: "مبيعات", color: "var(--color-primary)" },
  rentals: { label: "إيجارات", color: "var(--color-olive)" },
}

export default function EarningsPage() {
  const [timeFilter, setTimeFilter] = useState("6months")

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/dashboard" className="hover:text-primary">لوحة التحكم</Link>
            <ChevronRight className="h-4 w-4 rotate-180" />
            <span className="text-foreground">تقرير الأرباح</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">تقرير الأرباح</h1>
              <p className="text-muted-foreground mt-1">تتبعي أرباحك ومعاملاتك المالية</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 ml-2" />
              تصدير التقرير
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color === "olive" ? "bg-olive/10" : stat.color === "muted" ? "bg-muted" : "bg-primary/10"}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color === "olive" ? "text-olive" : stat.color === "muted" ? "text-muted-foreground" : "text-primary"}`} />
                    </div>
                    {stat.change && (
                      <Badge variant="secondary" className={stat.trend === "up" ? "bg-olive/10 text-olive" : "bg-destructive/10 text-destructive"}>
                        {stat.trend === "up" ? <TrendingUp className="h-3 w-3 ml-1" /> : <TrendingDown className="h-3 w-3 ml-1" />}
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                  {stat.description && <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>الأرباح الشهرية</CardTitle>
                <CardDescription>مقارنة بين المبيعات والإيجارات</CardDescription>
              </div>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">آخر 3 أشهر</SelectItem>
                  <SelectItem value="6months">آخر 6 أشهر</SelectItem>
                  <SelectItem value="year">السنة كاملة</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={8}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${value}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="مبيعات" />
                    <Bar dataKey="rentals" fill="var(--color-olive)" radius={[4, 4, 0, 0]} name="إيجارات" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /><span className="text-sm text-muted-foreground">مبيعات</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-olive" /><span className="text-sm text-muted-foreground">إيجارات</span></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>سجل المعاملات</CardTitle>
                <CardDescription>الرسوم متغيرة حسب نوع المعاملة وقد تتغير حسب العروض الحالية.</CardDescription>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="تصفية" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="sale">مبيعات</SelectItem>
                  <SelectItem value="rental">إيجارات</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>القطعة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الرسوم (متغيرة)</TableHead>
                    <TableHead>صافي الربح</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.listing}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={transaction.type === "sale" ? "bg-primary/10 text-primary" : "bg-olive/10 text-olive"}>
                          {transaction.type === "sale" ? "بيع" : "إيجار"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                      <TableCell>{transaction.amount} د.ك</TableCell>
                      <TableCell className="text-muted-foreground">-{transaction.fee} د.ك</TableCell>
                      <TableCell className="font-bold text-primary">{transaction.net} د.ك</TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[transaction.status].variant}>
                          {statusLabels[transaction.status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
