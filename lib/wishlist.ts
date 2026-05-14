import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function isInWishlist(userId: string, listingId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('wishlists')
    .select('listing_id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .maybeSingle()
  return !!data
}

export async function fetchWishlist(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('wishlists')
    .select('listing_id, created_at, listing:listings!listing_id(id, title, price_buy, images, status, owner_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}
