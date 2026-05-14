'use server'

import 'server-only'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const uuidSchema = z.string().uuid()

export async function toggleWishlistAction(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'يجب تسجيل الدخول' }
  const parsed = uuidSchema.safeParse(listingId)
  if (!parsed.success) return { error: 'منتج غير صحيح' }

  const { data: existing } = await supabase
    .from('wishlists')
    .select('listing_id')
    .eq('user_id', user.id)
    .eq('listing_id', parsed.data)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', parsed.data)
    if (error) return { error: error.message }
    revalidatePath(`/listings/${parsed.data}`)
    revalidatePath('/wishlist')
    return { added: false }
  } else {
    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: user.id, listing_id: parsed.data })
    if (error) return { error: error.message }
    revalidatePath(`/listings/${parsed.data}`)
    revalidatePath('/wishlist')
    return { added: true }
  }
}
