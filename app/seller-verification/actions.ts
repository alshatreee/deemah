'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const kycSchema = z.object({
  full_name: z.string().min(2, 'الاسم قصير').max(120),
  phone: z
    .string()
    .min(8, 'رقم الهاتف غير صحيح')
    .max(20)
    .regex(/^[0-9+\-\s]+$/, 'رقم الهاتف غير صحيح'),
  doc_path: z.string().min(1, 'صورة الهوية مطلوبة'),
})

export async function submitKycAction(formData: FormData): Promise<{ error?: string }> {
  const parsed = kycSchema.safeParse({
    full_name: String(formData.get('full_name') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    doc_path: String(formData.get('doc_path') ?? ''),
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
      kyc_full_name: parsed.data.full_name,
      kyc_phone: parsed.data.phone,
      kyc_doc_url: parsed.data.doc_path,
      kyc_submitted_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('[submitKycAction]', error.message)
    return { error: 'تعذّر إرسال الطلب' }
  }

  revalidatePath('/seller-verification')
  revalidatePath('/admin/seller-kyc')
  return {}
}
