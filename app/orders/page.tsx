import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { requireUser } from '@/lib/auth'
import { fetchMyOrdersAsBuyer, fetchMyOrdersAsSeller } from '@/lib/orders'
import { listingPublicUrl } from '@/lib/storage'
import type { OrderWithListing } from '@/lib/types'

export const dynamic = 'force-dynamic'

function statusLabel(s: string): string {
  return (
    {
      pending: 'بانتظار الدفع',
      paid: 'مدفوع',
      shipped: 'قيد الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغى',
      refunded: 'مسترد',
    } as Record<string, string>
  )[s] ?? s
}

function OrderRow({ o }: { o: OrderWithListing }) {
  const img = o.listing?.images?.[0] ? listingPublicUrl(o.listing.images[0]) : '/images/listing-1.jpg'
  return (
    <Link href={`/orders/${o.id}`}>
      <Card className="hover:bg-muted/40 transition">
        <CardContent className="py-4 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
            <Image src={img} alt="" fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{o.listing?.title ?? 'قطعة محذوفة'}</p>
            <p className="text-xs text-muted-foreground">
              {Number(o.amount).toLocaleString('ar-KW')} د.ك — {new Date(o.created_at).toLocaleDateString('ar-KW')}
            </p>
          </div>
          <Badge variant="secondary">{statusLabel(o.status)}</Badge>
        </CardContent>
      </Card>
    </Link>
  )
}

export default async function OrdersPage() {
  const user = await requireUser()
  const [buyerOrders, sellerOrders] = await Promise.all([
    fetchMyOrdersAsBuyer(user.id),
    fetchMyOrdersAsSeller(user.id),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold">طلباتي</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">مشترياتي ({buyerOrders.length})</h2>
          {buyerOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-6 text-center">
              لا طلبات
            </p>
          ) : (
            <div className="space-y-2 max-w-3xl">
              {buyerOrders.map((o) => <OrderRow key={o.id} o={o} />)}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">مبيعاتي ({sellerOrders.length})</h2>
          {sellerOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-6 text-center">
              لا مبيعات
            </p>
          ) : (
            <div className="space-y-2 max-w-3xl">
              {sellerOrders.map((o) => <OrderRow key={o.id} o={o} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
