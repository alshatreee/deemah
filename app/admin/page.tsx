import { createClient } from '@/lib/supabase/server'

export default async function AdminHome() {
  const supabase = await createClient()
  const [users, listings, orders, disputes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ])

  const stats = [
    { label: 'المستخدمات', value: users.count ?? 0 },
    { label: 'المنتجات', value: listings.count ?? 0 },
    { label: 'الطلبات', value: orders.count ?? 0 },
    { label: 'نزاعات مفتوحة', value: disputes.count ?? 0 },
  ]

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6">نظرة عامة</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
