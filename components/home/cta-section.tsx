import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>انضمي لمجتمع ديمة</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight text-balance">
            حوّلي خزانتك إلى مصدر دخل
          </h2>
          
          <p className="mt-6 text-lg md:text-xl text-white/80 leading-relaxed">
            آلاف القطع الفاخرة تنتظر مالكة جديدة. ابدئي اليوم وانضمي لأكبر مجتمع للأزياء في الكويت.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              asChild 
              className="text-base bg-white text-primary hover:bg-white/90"
            >
              <Link href="/register">
                سجّلي الآن مجاناً
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="text-base border-white/30 text-white bg-white/10 hover:bg-white/20"
            >
              <Link href="/how-it-works">
                تعرّفي على المنصة
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
