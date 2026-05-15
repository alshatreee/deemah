import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "الشروط والأحكام | ديمة",
  description: "شروط وأحكام استخدام منصة ديمة لبيع الأزياء الفاخرة في الكويت",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3">الشروط والأحكام</h1>
            <p className="text-muted-foreground">آخر تحديث: مايو 2026</p>
          </div>

          <div className="space-y-8 text-foreground leading-relaxed">

            <section>
              <h2 className="text-xl font-bold mb-3">١. القبول والموافقة</h2>
              <p className="text-muted-foreground">
                باستخدامك لمنصة ديمة فإنك توافقين على هذه الشروط. إن لم توافقي، يرجى عدم
                استخدام المنصة. نحتفظ بحق تعديل هذه الشروط مع إخطارك بالتغييرات الجوهرية.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٢. طبيعة المنصة</h2>
              <p className="text-muted-foreground">
                ديمة منصة وسيطة تُمكّن الأفراد من بيع وشراء قطع الأزياء الفاخرة المستعملة.
                ديمة ليست طرفاً في الصفقات بين البائعات والمشتريات، ولا تضمن جودة المنتجات
                أو سلوك المستخدمات، لكنها توفر بيئة آمنة وموثوقة لإتمام المعاملات.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٣. شروط التسجيل</h2>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>يجب أن تكونِ مقيمةً في دولة الكويت أو تمتلكي عنواناً للشحن داخلها</li>
                <li>يجب أن تكوني في سن 18 عاماً أو أكثر</li>
                <li>معلومات حسابك يجب أن تكون صحيحة ودقيقة</li>
                <li>أنتِ مسؤولة عن الحفاظ على سرية كلمة مرورك</li>
                <li>يُمنع إنشاء أكثر من حساب واحد</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٤. قواعد نشر الإعلانات</h2>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>الصور والأوصاف يجب أن تمثل القطعة الفعلية بدقة</li>
                <li>السعر المعروض هو السعر النهائي شاملاً جميع الرسوم</li>
                <li>يُمنع عرض منتجات مقلدة أو مسروقة أو مخالفة للقانون</li>
                <li>يُمنع تضمين معلومات تواصل شخصية في الإعلانات</li>
                <li>ديمة تحتفظ بحق إزالة أي إعلان يخالف هذه القواعد</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٥. المعاملات والدفع</h2>
              <p className="text-muted-foreground">
                تتم المدفوعات عبر بوابة Tap Payments الآمنة. عند إتمام الشراء، يُحجز المبلغ
                ويُحوّل للبائعة بعد تأكيد الاستلام. رسوم المنصة تُخصم تلقائياً وتُعرض
                بوضوح قبل إتمام أي معاملة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٦. سياسة الاسترجاع والنزاعات</h2>
              <p className="text-muted-foreground">
                في حال وجود خلاف بين المشترية والبائعة (قطعة لا تطابق الوصف، أو ضرر)،
                يمكن فتح نزاع خلال 48 ساعة من استلام القطعة. فريق ديمة سيراجع
                النزاع ويتخذ القرار المناسب. قرار ديمة في النزاعات نهائي.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٧. السلوك المحظور</h2>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>التحايل على منظومة الدفع أو إتمام صفقات خارج المنصة</li>
                <li>التحرش أو الإساءة أو التهديد للمستخدمات الأخريات</li>
                <li>نشر محتوى كاذب أو مضلل</li>
                <li>محاولة اختراق المنصة أو التلاعب بها تقنياً</li>
                <li>إنشاء تقييمات وهمية أو التلاعب بنظام التقييم</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٨. المسؤولية</h2>
              <p className="text-muted-foreground">
                ديمة وسيط تقني ولا تتحمل المسؤولية عن جودة المنتجات أو مطابقتها للوصف
                أو أي ضرر ناتج عن معاملات بين المستخدمات. مسؤولية ديمة القصوى في أي
                حادثة لا تتجاوز قيمة المعاملة المعنية.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">٩. إنهاء الحساب</h2>
              <p className="text-muted-foreground">
                تحتفظ ديمة بحق تعليق أو إلغاء أي حساب يخالف هذه الشروط أو يُلحق
                ضرراً بالمجتمع أو المنصة. يمكنك أيضاً حذف حسابك بنفسك في أي وقت
                من إعدادات الحساب.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">١٠. القانون المطبق</h2>
              <p className="text-muted-foreground">
                تخضع هذه الشروط لقوانين دولة الكويت. أي نزاع يُحسم أمام المحاكم
                الكويتية المختصة.
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                ملاحظة: هذه الشروط مرجع تشغيلي. يُنصح بمراجعة قانونية متخصصة قبل الإطلاق الرسمي.
              </p>
            </section>

          </div>

          <div className="mt-12 flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/privacy">سياسة الخصوصية</Link>
            </Button>
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
