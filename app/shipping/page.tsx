import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Truck, Clock, MapPin, Package } from "lucide-react"

export const metadata = {
  title: "الشحن والتسليم | ديمة",
  description: "معلومات الشحن والتسليم في منصة ديمة بالكويت",
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3">الشحن والتسليم</h1>
            <p className="text-muted-foreground">كيف تصلكِ القطعة بعد إتمام الشراء</p>
          </div>

          <div className="space-y-8 text-foreground/90 leading-relaxed">
            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">لقاء وجهاً لوجه</h2>
                  <p>
                    البائعة والمشترية يتفقن على نقطة لقاء آمنة داخل الكويت
                    (الأماكن العامة مثل المولات مفضّلة). لا توجد رسوم
                    إضافية. يتم تأكيد التسليم في التطبيق بعد المعاينة.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <Truck className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">توصيل من البائعة</h2>
                  <p>
                    بعض البائعات يقدّمن توصيل مباشر داخل محافظتهن. الرسوم
                    تُحدَّد من البائعة قبل الشراء وتظهر في صفحة القطعة.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <Package className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">شركة شحن</h2>
                  <p>
                    للقطع التي تتطلّب شحن داخلي عبر شركات الشحن المعتمدة
                    (أرامكس، البريد الكويتي). مدة التوصيل: ١–٣ أيام عمل.
                    رسوم الشحن تُحسب على المشترية ما لم تذكر البائعة خلاف ذلك.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">مدد التسليم</h2>
                  <ul className="list-disc pr-5 space-y-1">
                    <li>لقاء وجهاً لوجه: حسب الاتفاق (عادةً ٢٤ ساعة)</li>
                    <li>توصيل من البائعة: ١–٢ يوم</li>
                    <li>شركة شحن: ١–٣ أيام عمل</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">عنوان مفقود أو خاطئ</h2>
              <p>
                المشترية مسؤولة عن دقّة عنوان التسليم. في حال ارتجاع
                الشحنة بسبب عنوان غير صحيح، البائعة غير ملزمة بإعادة الشحن
                مجاناً.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
