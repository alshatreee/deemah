import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deemah.com' // TODO: confirm production domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/messages/',
          '/orders/',
          '/profile/',
          '/checkout/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
