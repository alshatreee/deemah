import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/listings/product-card'
import { ListingsFilter } from '@/components/listings/listings-filter'
import { SortSelect } from '@/components/listings/sort-select'
import { isValidArea } from '@/lib/constants/areas'
import { CONDITIONS } from '@/lib/constants/conditions'
import { Button } from '@/components/ui/button'
import { fetchListings, type ListingFilters } from '@/lib/listings'
import { listingPublicUrl } from '@/lib/storage'
import type { ListingCategory, KidsGender, KidsAgeRange } from '@/lib/types'

interface ListingsPageProps {
  searchParams: Promise<{
    category?: string
    sub?: string
    size?: string
    color?: string
    brand?: string
    area?: string
    condition?: string
    gender?: string
    age?: string
    min?: string
    max?: string
    q?: string
    sort?: string
    page?: string
  }>
}

const VALID_CATEGORIES: ListingCategory[] = [
  'women',
  'men',
  'kids',
  'accessories',
  'shoes',
  'bags',
]
const VALID_GENDERS: KidsGender[] = ['boys', 'girls', 'unisex']
const VALID_AGES: KidsAgeRange[] = ['0-2', '3-5', '6-9', '10-12']

const PAGE_SIZE = 24

function parseFilters(sp: Awaited<ListingsPageProps['searchParams']>): ListingFilters {
  const cat =
    sp.category && VALID_CATEGORIES.includes(sp.category as ListingCategory)
      ? (sp.category as ListingCategory)
      : undefined
  const gender =
    cat === 'kids' && sp.gender && VALID_GENDERS.includes(sp.gender as KidsGender)
      ? (sp.gender as KidsGender)
      : undefined
  const age_range =
    cat === 'kids' && sp.age && VALID_AGES.includes(sp.age as KidsAgeRange)
      ? (sp.age as KidsAgeRange)
      : undefined
  const validSorts = ['price_asc', 'price_desc', 'rating', 'popular', 'featured', 'newest'] as const
  const sort: ListingFilters['sort'] = (validSorts as readonly string[]).includes(sp.sort ?? '')
    ? (sp.sort as ListingFilters['sort'])
    : 'newest'
  const validConditions = CONDITIONS.map((c) => c.id) as readonly string[]
  const condition = sp.condition && validConditions.includes(sp.condition) ? sp.condition : undefined
  const area = isValidArea(sp.area) ? sp.area : undefined
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  return {
    category: cat,
    sub_category: sp.sub,
    size: sp.size,
    color: sp.color,
    brand: sp.brand,
    area,
    condition,
    gender,
    age_range,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    search: sp.q,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  }
}

function imageOrPlaceholder(images: string[]): string {
  const first = images[0]
  if (!first) return '/images/listing-1.jpg'
  return listingPublicUrl(first)
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const sp = await searchParams
  const filters = parseFilters(sp)
  const { items, total } = await fetchListings(filters)
  const currentPage = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const hasMore = currentPage * PAGE_SIZE < total

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">تصفحي القطع</h1>
            <p className="mt-2 text-muted-foreground">
              اكتشفي أحدث الأزياء الفاخرة من بائعاتنا الموثوقات
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <ListingsFilter variant="sheet-only" />
              <p className="text-sm text-muted-foreground hidden sm:block">{total} نتيجة</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <SortSelect />
            <form className="flex items-center gap-2">
              <input
                type="search"
                name="q"
                defaultValue={sp.q ?? ''}
                placeholder="ابحثي…"
                className="h-10 px-3 rounded-md border bg-background text-sm"
              />
              <Button type="submit" variant="outline" size="sm">
                بحث
              </Button>
            </form>
            </div>
          </div>

          <div className="flex gap-8">
            <ListingsFilter />

            <div className="flex-1">
              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed p-12 text-center">
                  <p className="text-muted-foreground mb-4">لا توجد قطع مطابقة حالياً</p>
                  <Link href="/listings/new">
                    <Button>أضيفي أول قطعة</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {items.map((l) => (
                    <ProductCard
                      key={l.id}
                      id={l.id}
                      title={l.title}
                      price={Number(l.price_buy ?? 0)}
                      originalPrice={l.original_price ? Number(l.original_price) : null}
                      brand={l.brand}
                      type="sale"
                      image={imageOrPlaceholder(l.images)}
                      seller={{
                        name: l.owner?.full_name ?? l.owner?.username ?? 'بائعة',
                        rating: Number(l.owner?.rating ?? 0),
                        verified: !!l.owner?.authenticated_at,
                      }}
                      authenticityVerified={l.authenticity_status === 'verified'}
                      condition={l.condition}
                      size={l.size}
                    />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="mt-12 text-center">
                  <Link
                    href={{
                      pathname: '/listings',
                      query: { ...sp, page: currentPage + 1 },
                    }}
                  >
                    <Button variant="outline" size="lg">
                      تحميل المزيد
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
