import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react"

export const metadata = {
  title: "الإرجاع والاسترداد",
  description: "سياسة الإرجاع والاسترداد في ديمة",
}

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3">الإرجاع والاسترداد</h1>
            <p className="text-muted-foreground">سياستنا لحماية الطرفين</p>
          </div>

          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">متى يحقّ لكِ الإرجاع</h2>
                  <ul className="list-disc pr-5 space-y-1">
                    <li>القطعة لا تطابق الوصف أو الصور</li>
                    <li>القطعة مزيّفة أو غير أصلية (للقطع المُعلَن أنها أصلية)</li>
                    <li>عيوب لم تذكرها البائعة في الإعلان</li>
                    <li>المقاس أو اللون مختلف بشكل واضح</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <RotateCcw className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">مدة الإرجاع</h2>
                  <p>
                    ٤٨ ساعة من وقت الاستلام لفتح نزاع. بعد هذه المدة
                    تُعتبر القطعة مقبولة من المشترية.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">لا يحقّ الإرجاع</h2>
                  <ul className="list-disc pr-5 space-y-1">
                    <li>تغيّر رأي المشترية</li>
                    <li>قطع مستعملة (worn) بعد الاستلام</li>
                    <li>الإكسسوارات الشخصية والداخلية</li>
                    <li>قطع تم تعديلها (خياطة، صباغة، إلخ)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">آلية الاسترداد</h2>
              <ol className="list-decimal pr-5 space-y-2">
                <li>افتحي نزاعاً من صفحة الطلب خلال ٤٨ ساعة</li>
                <li>صوّري المشكلة وأرفقي وصفاً</li>
                <li>تتواصل ديمة مع البائعة لمراجعة الحالة</li>
                <li>عند ثبوت الحق، يتم استرداد المبلغ كاملاً عبر نفس وسيلة الدفع</li>
                <li>إعادة شحن القطعة على حساب البائعة في حالة الخطأ</li>
              </ol>
            </section>

            <section className="text-sm text-muted-foreground border-t pt-6">
              <p>
                ديمة منصّة وسيطة. القرار النهائي في النزاعات يصدر عن فريق
                ديمة بعد فحص الأدلّة من الطرفين.
              </p>
            </section>

            <section className="text-xs text-muted-foreground border-t pt-6 mt-8">
              <p>آخر تحديث: مايو 2026 · <a href="/terms" className="underline hover:text-primary">الشروط والأحكام</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
