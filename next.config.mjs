import { withSentryConfig } from '@sentry/nextjs'

// Content-Security-Policy: allowlist Supabase, Tap, Sentry, Resend, GA, Clarity.
// Note: 'unsafe-inline' and 'unsafe-eval' in script-src are required for
// Next.js inline scripts (especially in development). Future iteration should
// tighten this by using per-request nonces in middleware. Known limitation.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.tap.company https://secure-acceptance.cybersource.com https://www.googletagmanager.com https://www.clarity.ms https://*.sentry.io https://*.ingest.sentry.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: https://*.supabase.co https://*.tap.company",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.tap.company https://*.sentry.io https://*.ingest.sentry.io https://*.upstash.io https://www.google-analytics.com https://www.clarity.ms https://c.clarity.ms",
  "frame-src 'self' https://*.tap.company https://secure-acceptance.cybersource.com",
  "form-action 'self' https://*.tap.company",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
]
const contentSecurityPolicy = cspDirectives.join('; ')

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(self "https://*.tap.company" "https://secure-acceptance.cybersource.com")',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
]

const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: 'kk-uh',
  project: 'deemah',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  tunnelRoute: '/monitoring',
})
