'use server'
import 'server-only'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/guard'

const statusSchema = z.enum(['draft', 'active', 'sold', 'archived'])

export async function setListingStatusAction(listingId: string, status: string) {
  await requireAdmin()
  const parsedStatus = statusSchema.safeParse(status)
  if (!parsedStatus.success) return { error: 'حالة غير صحيحة' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('listings')
    .update({ status: parsedStatus.data, updated_at: new Date().toISOString() })
    .eq('id', listingId)
  if (error) return { error: error.message }
  revalidatePath('/admin/listings')
  return { success: true }
}
