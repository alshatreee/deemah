import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedListings } from "@/components/home/featured-listings"
import { HowItWorks } from "@/components/home/how-it-works"
import { CTASection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedListings />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
