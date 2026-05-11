import { createClient } from '@/lib/supabase/server'
import type { OrderWithListing } from '@/lib/types'

const LISTING_SELECT = 'id, title, images, owner_id, price_buy'
const BUYER_SELECT = 'id, username, full_name, avatar_url'

export async function fetchMyOrdersAsBuyer(userId: string): Promise<OrderWithListing[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`*, listing:listings!orders_listing_id_fkey(${LISTING_SELECT}), buyer:users!orders_buyer_id_fkey(${BUYER_SELECT})`)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[orders:buyer] error:', error.message)
    return []
  }
  return (data ?? []) as unknown as OrderWithListing[]
}

export async function fetchMyOrdersAsSeller(userId: string): Promise<OrderWithListing[]> {
  const supabase = await createClient()
  const { data: ownedListings } = await supabase
    .from('listings')
    .select('id')
    .eq('owner_id', userId)
  const ids = (ownedListings ?? []).map((l) => l.id as string)
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('orders')
    .select(`*, listing:listings!orders_listing_id_fkey(${LISTING_SELECT}), buyer:users!orders_buyer_id_fkey(${BUYER_SELECT})`)
    .in('listing_id', ids)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[orders:seller] error:', error.message)
    return []
  }
  return (data ?? []) as unknown as OrderWithListing[]
}

export async function fetchOrderById(id: string): Promise<OrderWithListing | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`*, listing:listings!orders_listing_id_fkey(${LISTING_SELECT}), buyer:users!orders_buyer_id_fkey(${BUYER_SELECT})`)
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('[orders:detail] error:', error.message)
    return null
  }
  return (data as unknown as OrderWithListing) ?? null
}
