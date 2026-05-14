import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MapPin, Pencil } from 'lucide-react'
import { fetchListingById } from '@/lib/listings'
import { listingPublicUrl } from '@/lib/storage'
import { getUser } from '@/lib/auth'
import { isInWishlist } from '@/lib/wishlist'
import { BuyButton } from './buy-button'
import { WishlistButton } from '@/components/listings/wishlist-button'
import { TrackListingView } from '@/components/analytics/track-listing-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deemah.com'

const GENDER_LABEL: Record<string, string> = {
  boys: 'أولاد',
  girls: 'بنات',
  unisex: 'للجنسين',
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const listing = await fetchListingById(id)
  if (!listing) notFound()

  const me = await getUser()
  const isOwner = !!me && me.id === listing.owner_id
  const inWishlist = me ? await isInWishlist(me.id, listing.id) : false
  const images = listing.images.length
    ? listing.images.map(listingPublicUrl)
    : ['/images/listing-1.jpg']

  const absoluteImages = images.map((src) =>
    src.startsWith('http') ? src : `${SITE_URL}${src}`,
  )

  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description ?? listing.title,
    image: absoluteImages,
    url: `${SITE_URL}/listings/${listing.id}`,
    sku: listing.id,
    category: listing.category,
    ...(listing.brand && {
      brand: { '@type': 'Brand', name: listing.brand },
    }),
    ...(listing.price_buy != null && {
      offers: {
        '@type': 'Offer',
        price: Number(listing.price_buy),
        priceCurrency: 'KWD',
        availability:
          listing.status === 'active'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        url: `${SITE_URL}/listings/${listing.id}`,
      },
    }),
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- structured data must be raw JSON
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Header />
      <TrackListingView listingId={listing.id} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                <Image
                  src={images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 8).map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-md overflow-hidden bg-muted"
                    >
                      <Image src={src} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
                  {listing.brand && (
                    <p className="text-muted-foreground mt-1">{listing.brand}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isOwner && (
                    <WishlistButton listingId={listing.id} initialInWishlist={inWishlist} />
                  )}
                  {isOwner && (
                    <Link href={`/listings/${listing.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        تعديل
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">للبيع</Badge>
                {listing.condition && (
                  <Badge variant="secondary">{listing.condition}</Badge>
                )}
                {listing.size && (
                  <Badge variant="secondary">المقاس: {listing.size}</Badge>
                )}
                {listing.color && (
                  <Badge variant="secondary">اللون: {listing.color}</Badge>
                )}
                {listing.category === 'kids' && listing.gender && (
                  <Badge variant="secondary">{GENDER_LABEL[listing.gender] ?? listing.gender}</Badge>
                )}
                {listing.category === 'kids' && listing.age_range && (
                  <Badge variant="secondary">عمر {listing.age_range}</Badge>
                )}
              </div>

              <div className="space-y-2">
                {listing.price_buy != null && (
                  <div className="text-3xl font-bold text-primary">
                    {Number(listing.price_buy).toLocaleString('ar-KW')} د.ك
                  </div>
                )}
              </div>

              {listing.description && (
                <Card>
                  <CardContent className="pt-6 whitespace-pre-wrap text-sm leading-7">
                    {listing.description}
                  </CardContent>
                </Card>
              )}

              {listing.owner && (
                <Card>
                  <CardContent className="pt-6">
                    <Link
                      href={`/profile/${listing.owner.username ?? listing.owner.id}`}
                      className="flex items-center gap-3 hover:opacity-80"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted overflow-hidden relative">
                        {listing.owner.avatar_url && (
                          <Image
                            src={listing.owner.avatar_url}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {listing.owner.full_name ?? listing.owner.username ?? 'بائعة'}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-amber-500" />
                          {Number(listing.owner.rating ?? 0).toFixed(1)}
                          <MapPin className="h-3 w-3 mr-2" />
                          الكويت
                        </p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {!isOwner && (
                <div className="space-y-3">
                  <BuyButton listingId={listing.id} loggedIn={!!me} />
                  <Link
                    href={
                      me
                        ? `/messages/${listing.owner_id}?listing=${listing.id}`
                        : `/login?redirectTo=/listings/${listing.id}`
                    }
                    className="block"
                  >
                    <Button className="w-full" variant="outline" size="lg">
                      راسلي البائعة
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
