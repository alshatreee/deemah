import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 via-background to-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>منصة الأزياء الفاخرة في الكويت</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              اشتري وأجّري
              <br />
              <span className="text-primary">أزياء فاخرة</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              بيعي وأجّري ملابسك مع كويتيات. منصة موثوقة وآمنة لتداول الأزياء الراقية.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" asChild className="text-base">
                <Link href="/listings">
                  تصفحي الآن
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link href="/listings/new">
                  أضيفي قطعتك
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex items-center gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">+1,500</p>
                <p className="text-sm text-muted-foreground">قطعة متاحة</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">+800</p>
                <p className="text-sm text-muted-foreground">بائعة موثوقة</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">4.9</p>
                <p className="text-sm text-muted-foreground">تقييم المنصة</p>
              </div>
            </div>
          </div>

          {/* Image Collage */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Image */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 transform rotate-3" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero-fashion.jpg"
                  alt="أزياء فاخرة"
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-2xl shadow-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-olive/10 flex items-center justify-center">
                    <span className="text-olive font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">معاملة آمنة</p>
                    <p className="text-sm text-muted-foreground">دفع محمي 100%</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -left-4 bg-card p-4 rounded-2xl shadow-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">★</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">4.9/5</p>
                    <p className="text-sm text-muted-foreground">تقييم المستخدمات</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
    </section>
  )
}
