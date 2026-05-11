import 'server-only'

const TAP_BASE_URL = 'https://api.tap.company/v2'

export interface TapCustomer {
  first_name: string
  email: string
  phone?: { country_code: string; number: string }
}

export interface CreateChargeInput {
  amount: number // in KWD
  currency?: 'KWD' | 'USD' | 'SAR' | 'AED'
  description: string
  customer: TapCustomer
  source?: { id: string } // 'src_card', 'src_kw.knet', 'src_all', etc.
  redirect_url: string
  reference?: { transaction?: string; order?: string }
  metadata?: Record<string, string>
  post?: { url: string } // webhook URL
}

export interface TapChargeResponse {
  id: string
  status:
    | 'INITIATED'
    | 'IN_PROGRESS'
    | 'CAPTURED'
    | 'AUTHORIZED'
    | 'DECLINED'
    | 'CANCELLED'
    | 'FAILED'
    | 'PENDING'
  amount: number
  currency: string
  reference?: { transaction?: string; order?: string }
  transaction?: { url?: string } // hosted payment URL for redirect
  metadata?: Record<string, string>
}

interface TapErrorBody {
  errors?: Array<{ code: string; description: string }>
  message?: string
}

function getKey(): string {
  const key = process.env.TAP_SECRET_KEY
  if (!key) {
    throw new Error('TAP_SECRET_KEY is not set')
  }
  return key
}

export async function createCharge(input: CreateChargeInput): Promise<TapChargeResponse> {
  const body = {
    amount: input.amount,
    currency: input.currency ?? 'KWD',
    threeDSecure: true,
    save_card: false,
    description: input.description,
    statement_descriptor: 'Deemah',
    metadata: input.metadata ?? {},
    reference: input.reference,
    receipt: { email: true, sms: false },
    customer: input.customer,
    source: input.source ?? { id: 'src_all' },
    post: input.post,
    redirect: { url: input.redirect_url },
  }

  const res = await fetch(`${TAP_BASE_URL}/charges`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const json = (await res.json()) as TapChargeResponse & TapErrorBody
  if (!res.ok) {
    const msg = json.errors?.[0]?.description ?? json.message ?? `Tap error ${res.status}`
    throw new Error(msg)
  }
  return json
}

export async function retrieveCharge(chargeId: string): Promise<TapChargeResponse> {
  const res = await fetch(`${TAP_BASE_URL}/charges/${chargeId}`, {
    headers: { Authorization: `Bearer ${getKey()}` },
    cache: 'no-store',
  })
  const json = (await res.json()) as TapChargeResponse & TapErrorBody
  if (!res.ok) {
    const msg = json.errors?.[0]?.description ?? json.message ?? `Tap error ${res.status}`
    throw new Error(msg)
  }
  return json
}

export function isPaid(status: TapChargeResponse['status']): boolean {
  return status === 'CAPTURED' || status === 'AUTHORIZED'
}

export function tapConfigured(): boolean {
  return Boolean(process.env.TAP_SECRET_KEY && process.env.TAP_PUBLIC_KEY)
}

/**
 * Verify a Tap webhook signature.
 *
 * Tap signs every webhook with HMAC-SHA256 using your secret key. The signature
 * is sent in the `hashstring` header. The hashed payload is constructed from a
 * fixed sequence of fields per Tap's docs:
 *   x_id + x_amount + x_currency + x_gateway_reference + x_payment_reference + x_status + x_created
 *
 * Returns `true` if the signature matches the computed HMAC. Constant-time compare.
 */
export interface TapSignatureFields {
  id?: string
  amount?: number | string
  currency?: string
  gateway_reference?: string
  payment_reference?: string
  status?: string
  created?: number | string
}

export function verifyWebhookSignature(
  signatureHeader: string | null,
  fields: TapSignatureFields,
): boolean {
  if (!signatureHeader) return false
  const secret = process.env.TAP_SECRET_KEY
  if (!secret) return false

  // Lazy import so this file stays edge-friendly for type-checks
  // (we still mark the route runtime as 'nodejs')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('node:crypto') as typeof import('node:crypto')

  const toHash =
    `x_id${fields.id ?? ''}` +
    `x_amount${fields.amount ?? ''}` +
    `x_currency${fields.currency ?? ''}` +
    `x_gateway_reference${fields.gateway_reference ?? ''}` +
    `x_payment_reference${fields.payment_reference ?? ''}` +
    `x_status${fields.status ?? ''}` +
    `x_created${fields.created ?? ''}`

  const hmac = crypto.createHmac('sha256', secret).update(toHash).digest('hex')
  const a = Buffer.from(hmac, 'utf8')
  const b = Buffer.from(signatureHeader, 'utf8')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
