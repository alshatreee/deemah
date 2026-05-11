'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const registerSchema = z.object({
  full_name: z.string().min(2, 'الاسم قصير'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون ٦ أحرف فأكثر'),
})

interface ActionResult {
  error?: string
  success?: boolean
}

interface AdminUserResponse {
  id?: string
  email?: string
  code?: number
  msg?: string
  error_code?: string
  error?: string
  error_description?: string
}

function mapAdminError(payload: AdminUserResponse, status: number): string {
  const msg = (payload.msg ?? payload.error_description ?? payload.error ?? '').toLowerCase()
  const code = payload.error_code ?? ''

  if (
    status === 422 &&
    (msg.includes('already') ||
      msg.includes('registered') ||
      code === 'email_exists' ||
      code === 'user_already_exists')
  ) {
    return 'هذا البريد مسجّل مسبقاً'
  }
  if (status === 422 && (msg.includes('password') || msg.includes('weak'))) {
    return 'كلمة المرور ضعيفة'
  }
  if (status === 429 || code.includes('rate_limit')) {
    return 'محاولات كثيرة، حاولي بعد قليل'
  }
  if (status === 400 && msg.includes('invalid')) {
    return 'البريد الإلكتروني غير مقبول'
  }
  return 'تعذّر إنشاء الحساب'
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[registerAction] Missing Supabase env vars')
    return { error: 'إعدادات الخادم غير مكتملة' }
  }

  const username = parsed.data.email.split('@')[0]

  // 1. Create confirmed user via admin endpoint (bypasses email confirmation)
  let adminStatus: number
  let adminPayload: AdminUserResponse
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: {
          full_name: parsed.data.full_name,
          username,
        },
      }),
      cache: 'no-store',
    })
    adminStatus = res.status
    adminPayload = (await res.json()) as AdminUserResponse
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown'
    console.error('[registerAction] admin fetch failed:', message)
    return { error: 'تعذّر الاتصال بخدمة المصادقة' }
  }

  if (adminStatus < 200 || adminStatus >= 300 || !adminPayload.id) {
    console.error(
      '[registerAction] admin error:',
      adminStatus,
      JSON.stringify(adminPayload),
    )
    return { error: mapAdminError(adminPayload, adminStatus) }
  }

  // 2. Sign user in to set session cookies via SSR client
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (signInError) {
    console.error('[registerAction] post-signup signin failed:', signInError.message)
    revalidatePath('/', 'layout')
    redirect('/login?registered=1')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
