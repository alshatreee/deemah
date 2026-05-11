import { NextResponse, type NextRequest } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
  isPaid,
  retrieveCharge,
  tapConfigured,
  verifyWebhookSignature,
  type TapChargeResponse,
} from '@/lib/payments/tap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface TapWebhookPayload {
  id?: string
  amount?: number | string
  currency?: string
  status?: string
  gateway?: { reference?: string }
  reference?: { transaction?: string; payment?: string; order?: string }
  transaction?: { created?: number | string }
  metadata?: { kind?: 'order'; target_id?: string }
}

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function insertEarningOnce(
  ownerId: string,
  amount: number,
  referenceId: string,
  description: string,
): Promise<void> {
  const supabase = adminClient()
  const { error } = await supabase.from('transactions').insert({
    user_id: ownerId,
    type: 'earning',
    amount,
    status: 'completed',
    reference_id: referenceId,
    description,
  })
  if (error && error.code !== '23505') {
    console.error('[webhook insertEarning] error:', error.message)
  }
}

async function applyPaid(targetId: string, chargeId: string, charge: TapChargeResponse): Promise<{ ok: boolean; error?: string }> {
  const supabase = adminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id, amount, listing_id, status, listings(owner_id)')
    .eq('id', targetId)
    .maybeSingle()
  if (!order) return { ok: false, error: 'order not found' }
  if (order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered') {
    return { ok: true } // idempotent no-op
  }
  if (order.status !== 'pending') return { ok: false, error: 'order not pending' }

  // P1: amount + currency validation
  const expectedAmount = Number(order.amount)
  const actualAmount = Number(charge.amount ?? 0)
  if (Math.abs(expectedAmount - actualAmount) > 0.001 || charge.currency !== 'KWD') {
    console.error(
      '[webhook applyPaid] amount mismatch',
      { expected: expectedAmount, actual: actualAmount, currency: charge.currency },
    )
    return { ok: false, error: 'amount mismatch' }
  }

  await supabase
    .from('orders')
    .update({ status: 'paid', payment_id: chargeId, updated_at: new Date().toISOString() })
    .eq('id', targetId)

  const ownerId = Array.isArray((order as unknown as { listings: unknown }).listings)
    ? (order as unknown as { listings: Array<{ owner_id: string }> }).listings[0]?.owner_id
    : (order as unknown as { listings: { owner_id: string } | null }).listings?.owner_id
  if (ownerId) {
    await insertEarningOnce(ownerId, expectedAmount, targetId, `بيع طلب ${targetId}`)
  }
  return { ok: true }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  let payload: TapWebhookPayload
  try {
    payload = JSON.parse(rawBody) as TapWebhookPayload
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  const chargeId = payload.id
  if (!chargeId) {
    return NextResponse.json({ ok: false, error: 'no id' }, { status: 400 })
  }

  // P1: HMAC signature — reject when configured + signature invalid
  if (tapConfigured()) {
    const sigHeader =
      req.headers.get('hashstring') ?? req.headers.get('x-tap-signature') ?? null
    const signatureValid = verifyWebhookSignature(sigHeader, {
      id: payload.id,
      amount: payload.amount,
      currency: payload.currency,
      gateway_reference: payload.gateway?.reference,
      payment_reference: payload.reference?.payment ?? payload.reference?.transaction,
      status: payload.status,
      created: payload.transaction?.created,
    })
    if (!signatureValid) {
      console.error('[tap/webhook] signature verification failed')
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 })
    }
  }

  let charge: TapChargeResponse
  try {
    charge = await retrieveCharge(chargeId)
  } catch (err: unknown) {
    console.error('[tap/webhook] retrieve failed:', err)
    return NextResponse.json({ ok: false, error: 'retrieve failed' }, { status: 502 })
  }

  if (!isPaid(charge.status)) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const kind = (charge.metadata?.kind ?? payload.metadata?.kind) as 'order' | undefined
  const targetId =
    charge.metadata?.target_id ?? payload.metadata?.target_id ?? charge.reference?.order

  if (kind !== 'order' || !targetId) {
    console.error('[tap/webhook] missing/invalid metadata; charge:', chargeId)
    return NextResponse.json({ ok: false, error: 'missing metadata' }, { status: 400 })
  }

  try {
    const result = await applyPaid(targetId, chargeId, charge)
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
    }
  } catch (err: unknown) {
    console.error('[tap/webhook] apply failed:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Tap webhook endpoint' })
}
