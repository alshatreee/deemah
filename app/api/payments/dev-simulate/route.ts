import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { tapConfigured } from '@/lib/payments/tap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  targetId: z.string().uuid(),
  success: z.boolean(),
})

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function insertEarningOnce(
  admin: ReturnType<typeof adminClient>,
  ownerId: string,
  amount: number,
  referenceId: string,
  description: string,
): Promise<void> {
  const { error } = await admin.from('transactions').insert({
    user_id: ownerId,
    type: 'earning',
    amount,
    status: 'completed',
    reference_id: referenceId,
    description,
  })
  if (error && error.code !== '23505') {
    console.error('[dev-simulate insert] error:', error.message)
  }
}

export async function POST(req: NextRequest) {
  if (tapConfigured()) {
    return NextResponse.json(
      { error: 'محاكاة الدفع متاحة فقط في وضع التطوير' },
      { status: 403 },
    )
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'الرجاء تسجيل الدخول' }, { status: 401 })

  const admin = adminClient()
  const fakeChargeId = `dev_${Date.now()}`

  const { data: order } = await admin
    .from('orders')
    .select('id, amount, listing_id, buyer_id, status, listings(owner_id)')
    .eq('id', parsed.data.targetId)
    .maybeSingle()
  if (!order || order.buyer_id !== user.id) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'الطلب لا يقبل الدفع' }, { status: 400 })
  }
  if (!parsed.data.success) {
    await admin
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', parsed.data.targetId)
    return NextResponse.json({ ok: true })
  }
  await admin
    .from('orders')
    .update({
      status: 'paid',
      payment_id: fakeChargeId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.targetId)
  const ownerId = Array.isArray((order as unknown as { listings: unknown }).listings)
    ? (order as unknown as { listings: Array<{ owner_id: string }> }).listings[0]?.owner_id
    : (order as unknown as { listings: { owner_id: string } | null }).listings?.owner_id
  if (ownerId) {
    await insertEarningOnce(
      admin,
      ownerId,
      Number(order.amount),
      parsed.data.targetId,
      `بيع طلب ${parsed.data.targetId} (dev)`,
    )
  }
  return NextResponse.json({ ok: true })
}
