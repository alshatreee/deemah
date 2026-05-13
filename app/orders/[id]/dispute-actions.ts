'use server'

import 'server-only'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { moderateText } from '@/lib/moderation/text-check'

const disputeSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.enum(['not_received', 'damaged', 'not_as_described', 'other']),
  description: z.string().trim().min(10).max(2000),
})

export async function openDisputeAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const parsed = disputeSchema.safeParse({
    orderId: formData.get('orderId'),
    reason: formData.get('reason'),
    description: formData.get('description'),
  })
  if (!parsed.success) {
    return { error: 'بيانات غير صحيحة' }
  }

  const textCheck = moderateText(parsed.data.description, { allowContactInfo: true })
  if (!textCheck.safe) {
    return { error: textCheck.reason }
  }

  // Verify order belongs to buyer and is in a disputable state
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, buyer_id, status')
    .eq('id', parsed.data.orderId)
    .single()
  if (orderError || !order) return { error: 'الطلب غير موجود' }
  if (order.buyer_id !== user.id) return { error: 'غير مصرح' }
  if (!['paid', 'shipped', 'delivered'].includes(order.status)) {
    return { error: 'لا يمكن فتح نزاع على هذا الطلب' }
  }

  // Check no open dispute already
  const { data: existing } = await supabase
    .from('disputes')
    .select('id')
    .eq('order_id', parsed.data.orderId)
    .in('status', ['open', 'reviewing'])
    .maybeSingle()
  if (existing) return { error: 'يوجد نزاع مفتوح على هذا الطلب بالفعل' }

  const { error: insertError } = await supabase
    .from('disputes')
    .insert({
      order_id: parsed.data.orderId,
      opened_by: user.id,
      reason: parsed.data.reason,
      description: parsed.data.description,
    })
  if (insertError) {
    console.error('[openDispute] error:', insertError.message)
    return { error: 'تعذر فتح النزاع' }
  }

  revalidatePath(`/orders/${parsed.data.orderId}`)
  return { success: true }
}
