import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface CategoryHeroProps {
  image: string
  imageAlt?: string
  titleLine1: string
  titleLine2: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  stats?: {
    listings?: string
    sellers?: string
    rating?: string
  }
}

export function CategoryHero({
  image,
  imageAlt = "أزياء فاخرة",
  titleLine1,
  titleLine2,
  primaryCtaLabel = "تصفحي الآن",
  primaryCtaHref = "/listings",
  secondaryCtaLabel = "ابدأ ببيع منتجك",
  secondaryCtaHref = "/listings/new",
  stats = {
    listings: "+1,500",
    sellers: "+800",
    rating: "4.9",
  },
}: CategoryHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 via-background to-background rounded-3xl border mb-8">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Content */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
              {titleLine1}
              <br />
              <span className="text-primary">{titleLine2}</span>
            </h2>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="lg" asChild className="text-base">
                <Link href={secondaryCtaHref}>
                  {secondaryCtaLabel}
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.rating}</p>
                <p className="text-xs text-muted-foreground">تقييم المستخدمين</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.sellers}</p>
                <p className="text-xs text-muted-foreground">ملابس مرفوعة</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.listings}</p>
                <p className="text-xs text-muted-foreground">عضو</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 transform rotate-3" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={image}
                  alt={imageAlt}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              <div className="absolute -bottom-4 -right-4 bg-card p-3 rounded-2xl shadow-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center">
                    <span className="text-olive font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">معاملة آمنة</p>
                    <p className="text-xs text-muted-foreground">دفع محمي 100%</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -left-4 bg-card p-3 rounded-2xl shadow-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">★</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{stats.rating}/5</p>
                    <p className="text-xs text-muted-foreground">تقييم المستخدمين</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
