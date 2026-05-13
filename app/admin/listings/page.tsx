import { createClient } from '@/lib/supabase/server'
import { ListingRow } from './listing-row'

export default async function AdminListings() {
  const supabase = await createClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, status, price_buy, owner_id, created_at, users!owner_id(username)')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6">المنتجات</h1>
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-right">العنوان</th>
            <th className="p-3 text-right">البائعة</th>
            <th className="p-3 text-right">السعر</th>
            <th className="p-3 text-right">الحالة</th>
            <th className="p-3 text-right">الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {(listings || []).map((l: any) => (
            <ListingRow key={l.id} listing={l} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
