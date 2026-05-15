'use server'
import 'server-only'

/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Returns true if valid. Returns false (never throws) on network errors.
 *
 * Required env var: TURNSTILE_SECRET_KEY
 * Get keys at: https://dash.cloudflare.com → Turnstile → Add site
 */
export async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  // If not configured yet, skip verification (dev / pre-launch)
  if (!secret || secret === 'REPLACE_ME') {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[turnstile] TURNSTILE_SECRET_KEY not set in production!')
    }
    return true
  }

  if (!token) return false

  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token }),
      },
    )
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    // Network error — fail open in dev, fail closed in prod
    return process.env.NODE_ENV !== 'production'
  }
}
