'use server'

import 'server-only'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface Result { error?: string; success?: boolean }

export async function blockUserAction(blockedId: string): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'يجب تسجيل الدخول' }
  if (user.id === blockedId) return { error: 'لا يمكن حظر نفسك' }

  const { error } = await supabase
    .from('blocks')
    .insert({ blocker_id: user.id, blocked_id: blockedId })

  if (error && error.code !== '23505') { // 23505 = unique violation (already blocked)
    console.error('[blockUserAction]', error.message)
    return { error: 'تعذّر الحظر' }
  }

  revalidatePath(`/profile`)
  return { success: true }
}

export async function unblockUserAction(blockedId: string): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'يجب تسجيل الدخول' }

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', blockedId)

  if (error) {
    console.error('[unblockUserAction]', error.message)
    return { error: 'تعذّر إلغاء الحظر' }
  }

  revalidatePath(`/profile`)
  return { success: true }
}

export async function isBlockedByMe(targetId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetId)
    .maybeSingle()

  return !!data
}
