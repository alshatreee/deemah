'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/guard'

export async function approveKycAction(userId: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({
      authenticated_at: new Date().toISOString(),
      authenticated_by: admin.userId,
      seller_status: 'approved',
    })
    .eq('id', userId)
  if (error) {
    console.error('[approveKyc]', error.message)
    return { error: 'فشل الموافقة' }
  }
  revalidatePath('/admin/seller-kyc')
  return {}
}

export async function rejectKycAction(userId: string): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({
      kyc_submitted_at: null,
      kyc_doc_url: null,
    })
    .eq('id', userId)
  if (error) {
    console.error('[rejectKyc]', error.message)
    return { error: 'فشل الرفض' }
  }
  revalidatePath('/admin/seller-kyc')
  return {}
}

export async function revokeKycAction(userId: string): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ authenticated_at: null, authenticated_by: null })
    .eq('id', userId)
  if (error) {
    return { error: 'فشل السحب' }
  }
  revalidatePath('/admin/seller-kyc')
  return {}
}
