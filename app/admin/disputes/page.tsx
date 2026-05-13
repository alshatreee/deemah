import { createClient } from '@/lib/supabase/server'
import { DisputeRow } from './dispute-row'

export default async function AdminDisputes() {
  const supabase = await createClient()
  const { data: disputes } = await supabase
    .from('disputes')
    .select('id, order_id, opened_by, reason, description, status, resolution_note, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6">النزاعات</h1>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-right">الطلب</th>
              <th className="p-3 text-right">السبب</th>
              <th className="p-3 text-right">الوصف</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(disputes || []).map((d: any) => (
              <DisputeRow key={d.id} dispute={d} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
