import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { createCharge, tapConfigured } from '@/lib/payments/tap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  kind: z.literal('order'),
  targetId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  if (!tapConfigured()) {
    return NextResponse.json({ error: 'Tap غير مهيأة' }, { status: 503 })
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
  const profile = await getProfile()

  const { data: order } = await supabase
    .from('orders')
    .select('id, amount, status, buyer_id')
    .eq('id', parsed.data.targetId)
    .maybeSingle()
  if (!order || order.buyer_id !== user.id) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'الطلب لا يقبل الدفع' }, { status: 400 })
  }
  const amount = Number(order.amount)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  try {
    const charge = await createCharge({
      amount,
      currency: 'KWD',
      description: `Deemah order ${order.id}`,
      customer: {
        first_name: profile?.full_name ?? user.email ?? 'Customer',
        email: user.email ?? `user_${user.id}@deemah.kw`,
      },
      reference: { order: parsed.data.targetId },
      metadata: { kind: 'order', target_id: parsed.data.targetId, user_id: user.id },
      redirect_url: `${siteUrl}/api/payments/tap/return?kind=order&id=${parsed.data.targetId}`,
      post: { url: `${siteUrl}/api/payments/tap/webhook` },
    })
    await supabase.from('orders').update({ payment_id: charge.id }).eq('id', parsed.data.targetId)
    const url = charge.transaction?.url
    if (!url) {
      return NextResponse.json({ error: 'Tap لم يرجع رابط الدفع' }, { status: 502 })
    }
    return NextResponse.json({ url, charge_id: charge.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown'
    console.error('[tap/create] error:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
