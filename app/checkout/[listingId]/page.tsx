import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { requireUser, getProfile } from '@/lib/auth'
import { fetchListingById } from '@/lib/listings'
import { listingPublicUrl } from '@/lib/storage'
import { CheckoutForm } from './checkout-form'

interface PageProps {
  params: Promise<{ listingId: string }>
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({ params }: PageProps) {
  const { listingId } = await params
  const me = await requireUser()
  const profile = await getProfile()
  const listing = await fetchListingById(listingId)
  if (!listing || !listing.price_buy) notFound()
  if (listing.owner_id === me.id) notFound()

  const img = listing.images[0] ? listingPublicUrl(listing.images[0]) : '/images/listing-1.jpg'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">إتمام الشراء</h1>

        <Card>
          <CardContent className="pt-6 flex gap-4 items-center">
            <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
              <Image src={img} alt="" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{listing.title}</p>
              <p className="text-sm text-muted-foreground">{listing.brand ?? ''}</p>
            </div>
            <div className="text-xl font-bold text-primary">
              {Number(listing.price_buy).toLocaleString('ar-KW')} د.ك
            </div>
          </CardContent>
        </Card>

        <CheckoutForm
          listingId={listingId}
          defaults={{
            full_name: profile?.full_name ?? '',
            phone: profile?.phone ?? '',
            city: profile?.city ?? 'الكويت',
          }}
        />
      </main>
      <Footer />
    </div>
  )
}
