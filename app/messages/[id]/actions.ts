'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const sendSchema = z.object({
  receiver_id: z.string().uuid('مستلم غير صالح'),
  body: z.string().min(1, 'الرسالة فارغة').max(2000),
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'الرجاء تسجيل الدخول' }

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
