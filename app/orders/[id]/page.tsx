import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { requireUser } from '@/lib/auth'
import { fetchOrderById } from '@/lib/orders'
import { createClient } from '@/lib/supabase/server'
import { listingPublicUrl } from '@/lib/storage'
import { OrderActions } from './actions-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

function statusLabel(s: string): string {
  return (
    {
      pending: 'بانتظار الدفع',
      paid: 'مدفوع — جاهز للشحن',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغى',
      refunded: 'مسترد',
    } as Record<string, string>
  )[s] ?? s
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const me = await requireUser()
  const order = await fetchOrderById(id)
  if (!order) notFound()

  const isBuyer = order.buyer_id === me.id
  const supabase = await createClient()
  const { data: ownerRow } = await supabase
    .from('listings')
    .select('owner_id')
    .eq('id', order.listing_id)
    .maybeSingle()
  const ownerId = (ownerRow?.owner_id ?? null) as string | null
  const isSeller = ownerId === me.id
  if (!isBuyer && !isSeller) notFound()

  const img = order.listing?.images?.[0]
    ? listingPublicUrl(order.listing.images[0])
    : '/images/listing-1.jpg'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
          <Badge variant="secondary">{statusLabel(order.status)}</Badge>
        </div>

        <Card>
          <CardContent className="pt-6 flex gap-4 items-start">
            <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
              <Image src={img} alt="" fill className="object-cover" />
            </div>
            <div className="flex-1 space-y-1">
              <Link href={`/listings/${order.listing_id}`} className="font-semibold hover:underline">
                {order.listing?.title ?? 'قطعة محذوفة'}
              </Link>
              <p className="text-lg font-bold">{Number(order.amount).toLocaleString('ar-KW')} د.ك</p>
            </div>
          </CardContent>
        </Card>

        {order.shipping_address && (
          <Card>
            <CardContent className="pt-6 space-y-1">
              <p className="text-sm text-muted-foreground mb-2">عنوان التوصيل</p>
              <p className="font-medium">{order.shipping_address.full_name}</p>
              <p className="text-sm" dir="ltr">{order.shipping_address.phone}</p>
              <p className="text-sm">
                {order.shipping_address.city}، {order.shipping_address.area}، قطعة {order.shipping_address.block}، شارع {order.shipping_address.street}، منزل {order.shipping_address.building}
              </p>
              {order.shipping_address.notes && (
                <p className="text-xs text-muted-foreground mt-2">{order.shipping_address.notes}</p>
              )}
            </CardContent>
          </Card>
        )}

        <OrderActions
          orderId={order.id}
          status={order.status}
          isBuyer={isBuyer}
          isSeller={isSeller}
        />

        <p className="text-xs text-muted-foreground">
          أُنشئ في {new Date(order.created_at).toLocaleString('ar-KW')}
        </p>
      </main>
      <Footer />
    </div>
  )
}
