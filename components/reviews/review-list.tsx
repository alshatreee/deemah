import { createClient } from '@/lib/supabase/server'

export async function ReviewList({ sellerId }: { sellerId: string }) {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, author:users!author_id(username, avatar_url)')
    .eq('target_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد.</p>
  }

  return (
    <ul className="space-y-3" dir="rtl">
      {reviews.map((r: any) => (
        <li key={r.id} className="rounded-md border p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            <span className="text-sm font-medium">{r.author?.username || 'مستخدمة'}</span>
            <span className="text-xs text-muted-foreground mr-auto">
              {new Date(r.created_at).toLocaleDateString('ar-KW')}
            </span>
          </div>
          {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
        </li>
      ))}
    </ul>
  )
}
