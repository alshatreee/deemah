import { requireAdmin } from '@/lib/admin/guard'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { KycRow } from './kyc-row'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'مراجعة KYC | admin' }

export default async function AdminKycPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: pending } = await supabase
    .from('users')
    .select('id, username, full_name, kyc_full_name, kyc_phone, kyc_doc_url, kyc_submitted_at, authenticated_at')
    .not('kyc_submitted_at', 'is', null)
    .is('authenticated_at', null)
    .order('kyc_submitted_at', { ascending: true })

  const { data: verified } = await supabase
    .from('users')
    .select('id, username, full_name, kyc_full_name, kyc_phone, authenticated_at')
    .not('authenticated_at', 'is', null)
    .order('authenticated_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-bold mb-6">مراجعة توثيق البائعات</h1>

          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">قيد المراجعة ({pending?.length ?? 0})</h2>
            <div className="space-y-3">
              {(pending ?? []).map((u: any) => (
                <KycRow key={u.id} user={u} mode="pending" />
              ))}
              {(!pending || pending.length === 0) && (
                <p className="text-sm text-muted-foreground">لا توجد طلبات حالياً.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">المُوثَّقات حديثاً</h2>
            <div className="space-y-3">
              {(verified ?? []).map((u: any) => (
                <KycRow key={u.id} user={u} mode="verified" />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
