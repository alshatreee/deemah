import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { requireUser } from '@/lib/auth'
import { fetchOrderById } from '@/lib/orders'
import { tapConfigured } from '@/lib/payments/tap'
import { PayClient } from '@/app/_payments/pay-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function OrderPayPage({ params }: PageProps) {
  const { id } = await params
  const me = await requireUser()
  const order = await fetchOrderById(id)
  if (!order) notFound()
  if (order.buyer_id !== me.id) notFound()
  if (order.status !== 'pending') redirect(`/orders/${id}`)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-xl space-y-6">
        <h1 className="text-2xl font-bold">الدفع</h1>
        <Card>
          <CardContent className="pt-6 space-y-2">
            <p className="text-sm text-muted-foreground">{order.listing?.title ?? 'القطعة'}</p>
            <p className="text-3xl font-bold text-primary">
              {Number(order.amount).toLocaleString('ar-KW')} د.ك
            </p>
          </CardContent>
        </Card>
        <PayClient
          targetId={order.id}
          amount={Number(order.amount)}
          tapConfigured={tapConfigured()}
        />
      </main>
      <Footer />
    </div>
  )
}
