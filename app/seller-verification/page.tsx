import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { KycForm } from './kyc-form'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'توثيق البائعة | ديمة' }

export default async function SellerVerificationPage() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('kyc_submitted_at, authenticated_at, kyc_full_name, kyc_phone')
    .eq('id', user.id)
    .maybeSingle()

  const submitted = !!profile?.kyc_submitted_at
  const verified = !!profile?.authenticated_at

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-4">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium text-sm">توثيق البائعة</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">احصلي على شارة “موثّقة”</h1>
            <p className="text-muted-foreground">
              ثقة المشتريات أهمّ ما يميّز بائعات ديمة. وثّقي حسابكِ
              للحصول على شارة زرقاء بجانب اسمكِ.
            </p>
          </div>

          {verified && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-900">حسابكِ موثّق ✓</p>
                  <p className="text-sm text-emerald-700">
                    تم توثيق هويتكِ. الشارة الزرقاء تظهر بجانب اسمكِ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {submitted && !verified && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-amber-900">قيد المراجعة</p>
                  <p className="text-sm text-amber-700">
                    استلمنا طلبكِ. عادةً ما تستغرق المراجعة ١-٢ يوم عمل.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!verified && (
            <div className="bg-card border rounded-xl p-6">
              <h2 className="font-bold mb-4">المعلومات المطلوبة</h2>
              <ul className="text-sm text-muted-foreground space-y-1 mb-6 list-disc pr-5">
                <li>الاسم الكامل كما في الهوية المدنية</li>
                <li>رقم الهاتف للتواصل</li>
                <li>صورة الوجه الأمامي للهوية المدنية الكويتية</li>
              </ul>
              <KycForm
                userId={user.id}
                initial={{
                  full_name: profile?.kyc_full_name ?? '',
                  phone: profile?.kyc_phone ?? '',
                }}
              />
              <p className="text-xs text-muted-foreground mt-4">
                بياناتكِ محفوظة بشكل خاص. لا يطّلع عليها سوى فريق التحقق.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
