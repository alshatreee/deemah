import { createClient } from '@/lib/supabase/server'
import { UserRow } from './user-row'

export default async function AdminUsers() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('users')
    .select('id, username, full_name, role, seller_status, rating, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6">المستخدمات</h1>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">المستخدم</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">التقييم</th>
              <th className="p-3 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
