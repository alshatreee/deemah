import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedListings } from "@/components/home/featured-listings"
import { HowItWorks } from "@/components/home/how-it-works"
import { CTASection } from "@/components/home/cta-section"
import { createClient } from "@/lib/supabase/server"

async function getPlatformStats() {
  try {
    const supabase = await createClient()
    const [listingsRes, sellersRes, reviewsRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('seller_status', 'approved'),
      supabase.from('reviews').select('rating'),
    ])
    const listings = listingsRes.count ?? 0
    const sellers = sellersRes.count ?? 0
    const ratings = reviewsRes.data ?? []
    const avgRating = ratings.length > 0
      ? (ratings.reduce((s, r) => s + (r.rating ?? 0), 0) / ratings.length).toFixed(1)
      : null
    return { listings, sellers, avgRating }
  } catch {
    return { listings: 0, sellers: 0, avgRating: null }
  }
}

export default async function HomePage() {
  const stats = await getPlatformStats()
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection stats={stats} />
        <CategoriesSection />
        <FeaturedListings />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
