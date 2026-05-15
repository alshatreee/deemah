import { createClient } from '@/lib/supabase/server'
import type {
  Listing,
  ListingCategory,
  ListingWithOwner,
  KidsGender,
  KidsAgeRange,
} from '@/lib/types'

const OWNER_SELECT = 'id, username, full_name, avatar_url, rating, is_verified, authenticated_at'
const LISTING_SELECT = `*, owner:users!listings_owner_id_fkey(${OWNER_SELECT})`

export interface ListingFilters {
  category?: ListingCategory
  sub_category?: string
  size?: string
  color?: string
  brand?: string
  area?: string
  condition?: string
  gender?: KidsGender
  age_range?: KidsAgeRange
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'featured' | 'rating'
  limit?: number
  offset?: number
}

export interface PagedListings {
  items: ListingWithOwner[]
  total: number
}

export async function fetchListings(filters: ListingFilters = {}): Promise<PagedListings> {
  const supabase = await createClient()
  const limit = Math.min(filters.limit ?? 24, 100)
  const offset = filters.offset ?? 0

  let q = supabase
    .from('listings')
    .select(LISTING_SELECT, { count: 'exact' })
    .eq('status', 'active')

  if (filters.category) q = q.eq('category', filters.category)
  if (filters.sub_category) q = q.eq('sub_category', filters.sub_category)
  if (filters.size) q = q.eq('size', filters.size)
  if (filters.color) q = q.eq('color', filters.color)
  if (filters.brand) q = q.eq('brand', filters.brand)
  if (filters.area) q = q.eq('area', filters.area)
  if (filters.condition) q = q.eq('condition', filters.condition)
  if (filters.search) q = q.ilike('searchable_text', `%${filters.search}%`)
  if (filters.gender) q = q.eq('gender', filters.gender)
  if (filters.age_range) q = q.eq('age_range', filters.age_range)
  if (typeof filters.minPrice === 'number') q = q.gte('price_buy', filters.minPrice)
  if (typeof filters.maxPrice === 'number') q = q.lte('price_buy', filters.maxPrice)

  switch (filters.sort) {
    case 'price_asc':
      q = q.order('price_buy', { ascending: true, nullsFirst: false })
      break
    case 'price_desc':
      q = q.order('price_buy', { ascending: false, nullsFirst: false })
      break
    case 'popular':
    case 'rating':
      q = q.order('views_count', { ascending: false })
      break
    case 'featured':
      q = q
        .order('original_price', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
      break
    case 'newest':
    default:
      q = q.order('created_at', { ascending: false })
  }

  q = q.range(offset, offset + limit - 1)

  const { data, error, count } = await q
  if (error) {
    console.error('[fetchListings] error:', error.message)
    return { items: [], total: 0 }
  }

  const items = (data ?? []) as unknown as ListingWithOwner[]
  return { items, total: count ?? items.length }
}

export async function fetchListingById(id: string): Promise<ListingWithOwner | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[fetchListingById] error:', error.message)
    return null
  }
  return (data as unknown as ListingWithOwner) ?? null
}

export async function fetchUserListings(ownerId: string): Promise<Listing[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchUserListings] error:', error.message)
    return []
  }
  return (data ?? []) as Listing[]
}

export async function incrementViews(id: string): Promise<void> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('views_count')
    .eq('id', id)
    .maybeSingle()
  if (!data) return
  await supabase
    .from('listings')
    .update({ views_count: (data.views_count ?? 0) + 1 })
    .eq('id', id)
}
