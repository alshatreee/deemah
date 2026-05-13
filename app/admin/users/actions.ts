'use server'

import 'server-only'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/guard'

const statusSchema = z.enum(['pending', 'approved', 'suspended', 'banned'])
const roleSchema = z.enum(['user', 'admin'])
const uuidSchema = z.string().uuid()

export async function setSellerStatusAction(userId: string, status: string) {
  await requireAdmin()
  const parsedId = uuidSchema.safeParse(userId)
  const parsedStatus = statusSchema.safeParse(status)
  if (!parsedId.success || !parsedStatus.success) {
    return { error: 'بيانات غير صحيحة' }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ seller_status: parsedStatus.data, updated_at: new Date().toISOString() })
    .eq('id', parsedId.data)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function setUserRoleAction(userId: string, role: string) {
  await requireAdmin()
  const parsedId = uuidSchema.safeParse(userId)
  const parsedRole = roleSchema.safeParse(role)
  if (!parsedId.success || !parsedRole.success) {
    return { error: 'بيانات غير صحيحة' }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ role: parsedRole.data, updated_at: new Date().toISOString() })
    .eq('id', parsedId.data)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}
