'use server'
import 'server-only'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { moderateText } from '@/lib/moderation/text-check'

const schema = z.object({
  orderId: z.string().uuid(),
  listingId: z.string().uuid(),
  targetId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
})

export async function submitReviewAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const parsed = schema.safeParse({
    orderId: formData.get('orderId'),
    listingId: formData.get('listingId'),
    targetId: formData.get('targetId'),
    rating: formData.get('rating'),
    comment: formData.get('comment') || undefined,
  })
  if (!parsed.success) return { error: 'بيانات غير صحيحة' }

  // Verify order belongs to buyer + delivered
  const { data: order } = await supabase
    .from('orders')
    .select('buyer_id, status, listing_id')
    .eq('id', parsed.data.orderId)
    .single()
  if (!order || order.buyer_id !== user.id) return { error: 'غير مصرح' }
  if (order.status !== 'delivered') return { error: 'يمكن التقييم بعد الاستلام فقط' }
  if (order.listing_id !== parsed.data.listingId) return { error: 'بيانات غير متطابقة' }

  if (parsed.data.comment) {
    const m = moderateText(parsed.data.comment, { allowContactInfo: true })
    if (!m.safe) return { error: m.reason }
  }

  // Prevent double review
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('author_id', user.id)
    .eq('listing_id', parsed.data.listingId)
    .maybeSingle()
  if (existing) return { error: 'سبق أن قيّمت هذا الطلب' }

  const { error } = await supabase
    .from('reviews')
    .insert({
      target_id: parsed.data.targetId,
      author_id: user.id,
      listing_id: parsed.data.listingId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    })
  if (error) return { error: error.message }

  revalidatePath(`/orders/${parsed.data.orderId}`)
  revalidatePath(`/profile/${parsed.data.targetId}`)
  return { success: true }
}
