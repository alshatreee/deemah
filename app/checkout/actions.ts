'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendOrderShippedEmail } from '@/lib/email/resend'

const shippingSchema = z.object({
  full_name: z.string().min(2, 'الاسم قصير'),
  phone: z.string().min(8, 'رقم غير صالح'),
  city: z.string().min(2, 'المدينة'),
  area: z.string().min(1, 'المنطقة'),
  block: z.string().min(1, 'القطعة'),
  street: z.string().min(1, 'الشارع'),
  building: z.string().min(1, 'المبنى'),
  notes: z.string().max(300).optional().or(z.literal('')),
})

interface ActionResult {
  error?: string
  id?: string
}

export async function createOrderAction(
  listingId: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = shippingSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    city: formData.get('city'),
    area: formData.get('area'),
    block: formData.get('block'),
    street: formData.get('street'),
    building: formData.get('building'),
    notes: formData.get('notes') || '',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'الرجاء تسجيل الدخول' }

  const { data: listing, error: lErr } = await supabase
    .from('listings')
    .select('id, owner_id, price_buy, status')
    .eq('id', listingId)
    .maybeSingle()
  if (lErr || !listing) return { error: 'القطعة غير موجودة' }
  if (!listing.price_buy) return { error: 'السعر غير محدّد' }
  if (listing.status !== 'active') return { error: 'القطعة غير متاحة' }
  if (listing.owner_id === user.id) return { error: 'لا يمكنك شراء قطعتك' }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      listing_id: listingId,
      buyer_id: user.id,
      amount: Number(listing.price_buy),
      status: 'pending',
      shipping_address: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        city: parsed.data.city,
        area: parsed.data.area,
        block: parsed.data.block,
        street: parsed.data.street,
        building: parsed.data.building,
        notes: parsed.data.notes || undefined,
      },
    })
    .select('id')
    .single()

  if (error) {
    console.error('[createOrderAction] error:', error.message)
    return { error: 'تعذّر إنشاء الطلب' }
  }

  revalidatePath('/orders')
  revalidatePath('/dashboard')
  redirect(`/orders/${data.id}/pay`)
}

export async function markShippedAction(orderId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'الرجاء تسجيل الدخول' }
  const { data: order } = await supabase
    .from('orders')
    .select('id, listing_id, listings!inner(owner_id)')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return { error: 'الطلب غير موجود' }
  const ownerId = Array.isArray((order as unknown as { listings: unknown }).listings)
    ? (order as unknown as { listings: Array<{ owner_id: string }> }).listings[0]?.owner_id
    : (order as unknown as { listings: { owner_id: string } }).listings.owner_id
  if (user.id !== ownerId) return { error: 'لا تملكين صلاحية' }

  const { error } = await supabase
    .from('orders')
    .update({ status: 'shipped', updated_at: new Date().toISOString() })
    .eq('id', orderId)
  if (error) {
    console.error('[markShipped] error:', error.message)
    return { error: 'تعذّر تحديث الطلب' }
  }

  // Fire-and-forget shipped notification to buyer
  try {
    const { data: orderDetails } = await supabase
      .from('orders')
      .select('amount, buyer_id, listing:listings!listing_id(title)')
      .eq('id', orderId)
      .single()
    if (orderDetails?.buyer_id) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
      const { data: buyerAuth } = await admin.auth.admin.getUserById(orderDetails.buyer_id)
      const buyerEmail = buyerAuth?.user?.email
      const listing = orderDetails.listing as unknown as { title?: string } | { title?: string }[] | null
      const listingTitle = Array.isArray(listing) ? listing[0]?.title : listing?.title
      if (buyerEmail) {
        sendOrderShippedEmail({
          to: buyerEmail,
          orderId,
          amount: Number(orderDetails.amount),
          listingTitle: listingTitle || 'منتج',
        }).catch(() => {})
      }
    }
  } catch (err) {
    console.error('[markShipped] email lookup failed:', err)
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')
  return {}
}

export async function markDeliveredAction(orderId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'الرجاء تسجيل الدخول' }
  const { data: order } = await supabase
    .from('orders')
    .select('id, buyer_id')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return { error: 'الطلب غير موجود' }
  if ((order as { buyer_id: string }).buyer_id !== user.id) {
    return { error: 'لا تملكين صلاحية' }
  }
  const { error } = await supabase
    .from('orders')
    .update({ status: 'delivered', updated_at: new Date().toISOString() })
    .eq('id', orderId)
  if (error) {
    console.error('[markDelivered] error:', error.message)
    return { error: 'تعذّر التحديث' }
  }
  revalidatePath(`/orders/${orderId}`)
  return {}
}
