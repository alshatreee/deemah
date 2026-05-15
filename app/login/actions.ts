'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { authLimiter } from '@/lib/ratelimit'
import { verifyTurnstile } from '@/lib/turnstile'

const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور قصيرة'),
})

interface ActionResult {
  error?: string
  success?: boolean
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  // CAPTCHA verification
  const captchaToken = formData.get('cf-turnstile-response')?.toString() ?? null
  const captchaOk = await verifyTurnstile(captchaToken)
  if (!captchaOk) {
    return { error: 'فشل التحقق من CAPTCHA. حاولي مجدداً.' }
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' }
  }

  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { success } = await authLimiter.limit(`ip:${ip}:${parsed.data.email}`)
  if (!success) {
    return { error: 'محاولات كثيرة جداً. حاولي بعد دقيقة.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'بريد إلكتروني أو كلمة مرور خاطئة' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function loginWithGoogle(): Promise<ActionResult> {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${siteUrl}/api/auth/callback` },
  })

  if (error) return { error: 'فشل تسجيل الدخول بـGoogle' }
  if (data.url) redirect(data.url)
  return { success: true }
}
