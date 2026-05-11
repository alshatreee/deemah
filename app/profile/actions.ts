'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const profileSchema = z.object({
  full_name: z.string().min(2, 'الاسم قصير').max(80),
  username: z
    .string()
    .min(3, 'اسم المستخدمة قصير')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'حروف إنجليزية وأرقام فقط'),
  phone: z.string().max(30).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(60).optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

interface ActionResult {
  error?: string
  success?: boolean
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    full_name: formData.get('full_name'),
    username: formData.get('username'),
    phone: formData.get('phone') || '',
    bio: formData.get('bio') || '',
    city: formData.get('city') || '',
    avatar_url: formData.get('avatar_url') || '',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'الرجاء تسجيل الدخول' }

  const { error } = await supabase
    .from('users')
    .update({
      full_name: parsed.data.full_name,
      username: parsed.data.username,
      phone: parsed.data.phone || null,
      bio: parsed.data.bio || null,
      city: parsed.data.city || null,
      avatar_url: parsed.data.avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    if (error.message.includes('duplicate') || error.code === '23505') {
      return { error: 'اسم المستخدمة مأخوذ' }
    }
    console.error('[updateProfileAction] error:', error.message)
    return { error: 'تعذّر حفظ الملف الشخصي' }
  }

  revalidatePath('/profile')
  revalidatePath(`/profile/${parsed.data.username}`)
  return { success: true }
}
