import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

function makeLimiter(tokens: number, window: `${number} s` | `${number} m` | `${number} h`, prefix: string) {
  if (!redis) {
    return {
      limit: async () => ({ success: true, limit: tokens, remaining: tokens, reset: Date.now() + 60_000 }),
    } as unknown as Ratelimit
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
    prefix: `deemah:${prefix}`,
  })
}

// 5 attempts per minute per IP — login + signup
export const authLimiter = makeLimiter(5, '1 m', 'auth')

// 3 listings creates per hour per user — abuse prevention
export const listingCreateLimiter = makeLimiter(3, '1 h', 'listing-create')

// 60 messages per minute per user — chat spam prevention
export const messageLimiter = makeLimiter(60, '1 m', 'msg')

// 30 webhook requests per minute per IP — Tap webhook should never exceed this
export const webhookLimiter = makeLimiter(30, '1 m', 'webhook')

/** Get a stable identifier from a request - prefer authenticated user id, fall back to IP. */
export function getRateLimitIdentifier(userId: string | null, request: Request): string {
  if (userId) return `user:${userId}`
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}
