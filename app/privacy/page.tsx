import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "سياسة الخصوصية | ديمة",
  description: "سياسة خصوصية منصة ديمة لبيع الأزياء الفاخرة في الكويت",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3">سياسة الخصوصية</h1>
            <p className="text-muted-foreground">آخر تحديث: مايو 2026</p>
          </div>

          <div className="space-y-8 text-foreground leading-relaxed">

            <section>
              <h2 className="text-xl font-bold mb-3">١. نظرة عامة</h2>
              <p className="text-muted-foreground">
                ديمة ("المنصة") منصة إلكترونية كويتية لبيع الأزياء الفاخرة بين الأفراد.
                نلتزم بحماية خصوصيتك وبياناتك الشخصية وفقاً للقانون الكويتي رقم 20 لسنة 2014
                بشأن المعاملات الإلكترونية وحماية البيانات، وكذلك المعايير الدولية المعمول بها.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٢. البيانات التي نجمعها</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">بيانات الحساب:</strong> الاسم، البريد الإلكتروني، كلمة المرور (مشفرة)، صورة الملف الشخصي.</p>
                <p><strong className="text-foreground">بيانات الإعلانات:</strong> صور الملابس، العنوان، الوصف، السعر، الحالة.</p>
                <p><strong className="text-foreground">بيانات المعاملات:</strong> سجلات الطلبات والمدفوعات — لا نخزن بيانات البطاقات الائتمانية إطلاقاً.</p>
                <p><strong className="text-foreground">بيانات الاستخدام:</strong> صفحات مُزارة، مشاهدات إعلانات، أنماط البحث — لتحسين تجربتك.</p>
                <p><strong className="text-foreground">بيانات تقنية:</strong> عنوان IP، نوع المتصفح، الجهاز — لأغراض الأمان ومكافحة الاحتيال.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٣. كيف نستخدم بياناتك</h2>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>تشغيل المنصة وإتمام المعاملات بينك وبين المشترين أو البائعين</li>
                <li>إرسال إشعارات تتعلق بطلباتك ورسائلك فقط</li>
                <li>الوقاية من الاحتيال وحماية أمان المنصة</li>
                <li>تحسين تجربة الاستخدام وأداء المنصة</li>
                <li>الامتثال للمتطلبات القانونية الكويتية</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                <strong className="text-foreground">لا نبيع بياناتك لأي طرف ثالث.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٤. حماية الصور والموقع الجغرافي</h2>
              <p className="text-muted-foreground">
                صور الهواتف الذكية تحتوي على بيانات EXIF قد تشمل إحداثيات GPS لمنزلك أو موقعك.
                <strong className="text-foreground"> تقوم ديمة تلقائياً بحذف جميع بيانات EXIF </strong>
                (بما فيها بيانات الموقع) من كل صورة تُرفع على المنصة قبل نشرها، لحمايتك الكاملة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٥. مشاركة البيانات</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>نشارك بياناتك الحد الأدنى الضروري مع:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong className="text-foreground">Tap Payments:</strong> معالجة المدفوعات فقط — لا يصل لبقية بياناتك</li>
                  <li><strong className="text-foreground">Supabase:</strong> تخزين البيانات على خوادم آمنة في أوروبا</li>
                  <li><strong className="text-foreground">Sentry:</strong> تتبع الأخطاء التقنية — بدون بيانات شخصية</li>
                  <li><strong className="text-foreground">الجهات القانونية:</strong> عند الطلب الرسمي وفق القانون الكويتي فقط</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٦. حقوقك</h2>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li><strong className="text-foreground">الوصول:</strong> يمكنك طلب نسخة من بياناتك الشخصية</li>
                <li><strong className="text-foreground">التصحيح:</strong> يمكنك تعديل بياناتك في إعدادات حسابك</li>
                <li><strong className="text-foreground">الحذف:</strong> يمكنك حذف حسابك وجميع بياناتك نهائياً من إعدادات الحساب</li>
                <li><strong className="text-foreground">الاعتراض:</strong> يمكنك إيقاف الإشعارات التسويقية في أي وقت</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٧. الاحتفاظ بالبيانات</h2>
              <p className="text-muted-foreground">
                نحتفظ ببياناتك طالما حسابك نشط. عند حذف الحساب تُحذف جميع بياناتك الشخصية
                خلال 30 يوماً، باستثناء ما يُلزمنا به القانون الكويتي من سجلات مالية (7 سنوات).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٨. ملفات تعريف الارتباط (Cookies)</h2>
              <p className="text-muted-foreground">
                نستخدم cookies ضرورية لتشغيل الجلسة وتسجيل الدخول، وcookies تحليلية اختيارية
                (Google Analytics، Microsoft Clarity) لقياس أداء المنصة. يمكنك رفض التحليلية
                عبر لافتة الموافقة عند أول زيارة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٩. الأمان</h2>
              <p className="text-muted-foreground">
                نطبق معايير أمان عالية: تشفير HTTPS، Row Level Security على قاعدة البيانات،
                حماية من هجمات الحقن، وحدود معدل الطلبات. مع ذلك لا يوجد نظام آمن 100%.
                إن لاحظت أي ثغرة، أخبرينا فوراً على البريد الإلكتروني للأمان.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">١٠. التواصل</h2>
              <p className="text-muted-foreground">
                لأي استفسار بخصوص خصوصيتك أو لممارسة حقوقك، تواصلي معنا عبر صفحة{" "}
                <Link href="/contact" className="text-primary underline underline-offset-2">
                  تواصلي معنا
                </Link>.
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                ملاحظة: هذه السياسة مرجع تشغيلي. يُنصح بمراجعة قانونية متخصصة قبل الإطلاق الرسمي
                للتأكد من الامتثال الكامل للقانون الكويتي.
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
