// Shared DB types matching supabase/schema.sql

export type ListingCategory =
  | 'women'
  | 'men'
  | 'kids'
  | 'accessories'
  | 'shoes'
  | 'bags'

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair'

export type ListingStatus = 'draft' | 'active' | 'sold' | 'archived'

export type KidsGender = 'boys' | 'girls' | 'unisex'
export type KidsAgeRange = '0-2' | '3-5' | '6-9' | '10-12'
export type KwAreaId =
  | 'capital'
  | 'hawalli'
  | 'farwaniya'
  | 'mubarak'
  | 'ahmadi'
  | 'jahra'

export type DeliveryMethod = 'meet_in_person' | 'seller_delivery' | 'courier'


export interface UserProfile {
  id: string
  username: string | null
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  bio: string | null
  city: string | null
  rating: number | null
  is_verified: boolean | null
  default_area: KwAreaId | null
  authenticated_at: string | null
  kyc_doc_url: string | null
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  owner_id: string
  title: string
  description: string | null
  category: ListingCategory
  brand: string | null
  size: string | null
  color: string | null
  condition: ListingCondition | null
  price_buy: number | null
  gender: KidsGender | null
  age_range: KidsAgeRange | null
  images: string[]
  status: ListingStatus
  views_count: number
  area: KwAreaId | null
  original_price: number | null
  sub_category: string | null
  delivery_method: DeliveryMethod | null
  delivery_fee: number | null
  authenticity_status: 'none' | 'in_review' | 'verified' | 'rejected' | null
  created_at: string
  updated_at: string
}

export interface ListingWithOwner extends Listing {
  owner: Pick<UserProfile, 'id' | 'username' | 'full_name' | 'avatar_url' | 'rating' | 'is_verified' | 'authenticated_at'> | null
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  listing_id: string | null
  body: string
  read_at: string | null
  created_at: string
}

export interface ConversationSummary {
  partner_id: string
  partner: Pick<UserProfile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
  last_message: Message
  unread_count: number
}

export interface ShippingAddress {
  full_name: string
  phone: string
  city: string
  area: string
  block: string
  street: string
  building: string
  notes?: string
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  listing_id: string
  buyer_id: string
  amount: number
  status: OrderStatus
  payment_id: string | null
  shipping_address: ShippingAddress | null
  created_at: string
  updated_at?: string | null
}

export interface OrderWithListing extends Order {
  listing: Pick<Listing, 'id' | 'title' | 'images' | 'owner_id' | 'price_buy'> | null
  buyer: Pick<UserProfile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
}

export interface Transaction {
  id: string
  user_id: string
  type: 'payout' | 'earning' | 'refund' | 'fee'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  reference_id: string | null
  created_at: string
}
