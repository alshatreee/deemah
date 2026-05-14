import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/listings/product-card'
import { createClient } from '@/lib/supabase/server'
import { fetchWishlist } from '@/lib/wishlist'
import { listingPublicUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/wishlist')

  const items = await fetchWishlist(user.id)
  const listings = items
    .map((i: any) => i.listing)
    .filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">المفضلة</h1>
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">لا توجد منتجات في مفضلتك بعد.</p>
            <Link href="/listings" className="text-primary underline">تصفحي المنتجات</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((l: any) => {
              const img = l.images?.[0] ? listingPublicUrl(l.images[0]) : '/images/listing-1.jpg'
              return (
                <ProductCard
                  key={l.id}
                  id={l.id}
                  title={l.title}
                  price={Number(l.price_buy ?? 0)}
                  image={img}
                  type="sale"
                  seller={{ name: '', rating: 0 }}
                  isSaved
                />
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
