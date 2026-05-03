import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">الشروط والأحكام</h1>
            <p className="text-muted-foreground">
              آخر تحديث: 2026
            </p>
          </div>

          <div className="space-y-6 text-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold mb-2">١. مقدمة</h2>
              <p className="text-muted-foreground">
                مرحباً بك في ديمة. باستخدامك للمنصة فإنك توافقين على هذه الشروط.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">٢. استخدام المنصة</h2>
              <p className="text-muted-foreground">
                ديمة منصة لبيع وتأجير قطع الأزياء بين المستخدمات. يجب أن تكون القطع المعروضة صحيحة وموصوفة بدقة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">٣. الرسوم</h2>
              <p className="text-muted-foreground">
                قد تطبق ديمة رسوماً متغيرة على المعاملات. ستظهر الرسوم بوضوح قبل إتمام أي عملية.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">٤. ملاحظة</h2>
              <p className="text-muted-foreground">
                هذه نسخة أولية مختصرة. النسخة القانونية الكاملة قيد الإعداد.
              </p>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" asChild>
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
