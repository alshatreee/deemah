'use server'

import 'server-only'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/guard'

const statusSchema = z.enum(['open', 'reviewing', 'resolved_refund', 'resolved_release', 'closed'])
const uuidSchema = z.string().uuid()
const noteSchema = z.string().trim().min(1).max(500)

export async function resolveDisputeAction(disputeId: string, status: string, note: string) {
  await requireAdmin()
  const parsedId = uuidSchema.safeParse(disputeId)
  const parsedStatus = statusSchema.safeParse(status)
  const parsedNote = noteSchema.safeParse(note)
  if (!parsedId.success || !parsedStatus.success || !parsedNote.success) {
    return { error: 'بيانات غير صحيحة' }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from('disputes')
    .update({
      status: parsedStatus.data,
      resolution_note: parsedNote.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsedId.data)
  if (error) return { error: error.message }
  revalidatePath('/admin/disputes')
  return { success: true }
}
