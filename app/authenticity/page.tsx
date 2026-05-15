import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ShieldCheck, Eye, FileCheck, Award } from "lucide-react"

export const metadata = {
  title: "ضمان الأصالة | ديمة",
  description: "كيف نضمن أصالة القطع الفاخرة في ديمة",
}

export default function AuthenticityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full mb-4">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium text-sm">ضمان الأصالة</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">قطعكِ أصلية ١٠٠٪</h1>
            <p className="text-muted-foreground">
              أربع طبقات حماية لضمان أصالة كل قطعة فاخرة على ديمة
            </p>
          </div>

          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <Award className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">١. توثيق البائعة</h2>
                  <p>
                    كل بائعة على ديمة موثّقة عبر الهوية المدنية ورقم
                    الهاتف. البائعات اللاتي يبعن قطع فاخرة (شانيل، هيرميس،
                    لويس فويتون…) يخضعن لتحقّق إضافي قبل الموافقة.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <FileCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">٢. إثبات الأصالة</h2>
                  <p>للقطع الفاخرة، نطلب من البائعة:</p>
                  <ul className="list-disc pr-5 space-y-1 mt-2">
                    <li>صورة فاتورة الشراء الأصلية</li>
                    <li>بطاقة الأصالة (Authenticity Card)</li>
                    <li>حقيبة الغبار (Dust Bag) وعلبة المنتج</li>
                    <li>رمز الإنتاج التسلسلي (Serial Number)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <Eye className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">٣. مراجعة بصرية من ديمة</h2>
                  <p>
                    فريقنا يفحص صور القطعة قبل النشر. القطع التي تجتاز
                    الفحص تحصل على شارة <strong>“أصلية ✓”</strong>
                    الخضراء على بطاقة الإعلان.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">٤. ضمان الاسترداد</h2>
                  <p>
                    إذا ثبت أن قطعة مُعلَن أنها أصلية مزيّفة، نسترد المبلغ
                    كاملاً ونتخذ إجراءات ضدّ البائعة (حظر، نشر القائمة
                    السوداء، تبليغ الجهات المختصّة إذا لزم).
                  </p>
                </div>
              </div>
            </section>

            <section className="text-sm text-muted-foreground border-t pt-6">
              <p>
                <strong>ملاحظة:</strong> ديمة لا تستطيع ضمان أصالة القطع
                التي لم تجتز فحص الأصالة. ابحثي عن شارة “أصلية ✓” قبل
                شراء قطعة فاخرة.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
