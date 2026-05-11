'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const CATEGORIES = ['women', 'men', 'kids', 'accessories', 'shoes', 'bags'] as const
const CONDITIONS = ['new', 'like_new', 'good', 'fair'] as const
const GENDERS = ['boys', 'girls', 'unisex'] as const
const AGE_RANGES = ['0-2', '3-5', '6-9', '10-12'] as const

const listingSchema = z
  .object({
    title: z.string().min(3, 'العنوان قصير').max(120),
    description: z.string().max(2000).optional().or(z.literal('')),
    category: z.enum(CATEGORIES, { message: 'صنّفي القطعة' }),
    brand: z.string().max(80).optional().or(z.literal('')),
    size: z.string().max(20).optional().or(z.literal('')),
    color: z.string().max(40).optional().or(z.literal('')),
    condition: z.enum(CONDITIONS).optional(),
    gender: z.enum(GENDERS).optional(),
    age_range: z.enum(AGE_RANGES).optional(),
    price_buy: z.number().positive('أدخلي سعر البيع'),
    images: z.array(z.string()).default([]),
  })
  .refine((d) => d.category !== 'kids' || !!d.gender, {
    message: 'حدّدي نوع الأطفال (أولاد/بنات/للجنسين)',
    path: ['gender'],
  })
  .refine((d) => d.category !== 'kids' || !!d.age_range, {
    message: 'حدّدي الفئة العمرية',
    path: ['age_range'],
  })

interface ActionResult {
  error?: string
  id?: string
}

function toNumber(v: FormDataEntryValue | null): number | undefined {
  if (v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function fromForm(formData: FormData): unknown {
  const images = formData.getAll('images').map(String).filter(Boolean)
  return {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    category: formData.get('category'),
    brand: String(formData.get('brand') ?? ''),
    size: String(formData.get('size') ?? ''),
    color: String(formData.get('color') ?? ''),
    condition: formData.get('condition') || undefined,
    gender: formData.get('gender') || undefined,
    age_range: formData.get('age_range') || undefined,
    price_buy: toNumber(formData.get('price_buy')),
    images,
  }
}

export async function createListingAction(formData: FormData): Promise<ActionResult> {
  const parsed = listingSchema.safeParse(fromForm(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'الرجاء تسجيل الدخول أولاً' }

  const insertPayload = {
    owner_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category,
    brand: parsed.data.brand || null,
    size: parsed.data.size || null,
    color: parsed.data.color || null,
    condition: parsed.data.condition ?? null,
    gender: parsed.data.category === 'kids' ? parsed.data.gender ?? null : null,
    age_range: parsed.data.category === 'kids' ? parsed.data.age_range ?? null : null,
    price_buy: parsed.data.price_buy,
    images: parsed.data.images,
    status: 'active' as const,
  }

  const { data, error } = await supabase
    .from('listings')
    .insert(insertPayload)
    .select('id')
    .single()

  if (error) {
    console.error('[createListingAction] error:', error.message)
    return { error: 'تعذّر حفظ القطعة' }
  }

  revalidatePath('/listings')
  revalidatePath('/dashboard')
  redirect(`/listings/${data.id}`)
}

export async function updateListingAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = listingSchema.safeParse(fromForm(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'الرجاء تسجيل الدخول أولاً' }

  const updatePayload = {
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category,
    brand: parsed.data.brand || null,
    size: parsed.data.size || null,
    color: parsed.data.color || null,
    condition: parsed.data.condition ?? null,
    gender: parsed.data.category === 'kids' ? parsed.data.gender ?? null : null,
    age_range: parsed.data.category === 'kids' ? parsed.data.age_range ?? null : null,
    price_buy: parsed.data.price_buy,
    images: parsed.data.images,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('listings')
    .update(updatePayload)
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    console.error('[updateListingAction] error:', error.message)
    return { error: 'تعذّر تحديث القطعة' }
  }

  revalidatePath('/listings')
  revalidatePath(`/listings/${id}`)
  revalidatePath('/dashboard')
  redirect(`/listings/${id}`)
}

export async function deleteListingAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'الرجاء تسجيل الدخول أولاً' }

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    console.error('[deleteListingAction] error:', error.message)
    return { error: 'تعذّر حذف القطعة' }
  }

  revalidatePath('/listings')
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
