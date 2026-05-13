'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { messageLimiter } from '@/lib/ratelimit'

const sendSchema = z.object({
  receiver_id: z.string().uuid('مستلم غير صالح'),
  body: z.string().trim().min(1, 'الرسالة فارغة').max(2000),
  listing_id: z.string().uuid().optional().or(z.literal('')),
})

interface ActionResult {
  error?: string
  success?: boolean
}

export async function sendMessageAction(formData: FormData): Promise<ActionResult> {
  const parsed = sendSchema.safeParse({
    receiver_id: formData.get('receiver_id'),
    body: formData.get('body'),
    listing_id: formData.get('listing_id') || undefined,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' }
  }

  // NOTE: Intentionally NOT calling moderateText() on message bodies.
  // Buyers and sellers legitimately need to exchange contact info (WhatsApp,
  // phone, address) to coordinate shipping and meetups. Blocking that would
  // break the core marketplace flow. We accept the bypass risk here.
  // Listing titles/descriptions ARE moderated (see app/listings/new/actions.ts)
  // because that's the public-discovery surface where contact-exfil is abuse.

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'الرجاء تسجيل الدخول' }

  const { success } = await messageLimiter.limit(`user:${user.id}`)
  if (!success) {
    return { error: 'محاولات كثيرة جداً. حاولي بعد دقيقة.' }
  }

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: parsed.data.receiver_id,
    listing_id: parsed.data.listing_id || null,
    body: parsed.data.body,
  })

  if (error) {
    console.error('[sendMessageAction] error:', error.message)
    return { error: 'تعذّر إرسال الرسالة' }
  }

  revalidatePath('/messages')
  revalidatePath(`/messages/${parsed.data.receiver_id}`)
  return { success: true }
}
