import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deemah.com' // TODO: confirm production domain

// Sitemap depends on a live DB call, so we render it on demand rather than at build time.
export const dynamic = 'force-dynamic'
export const revalidate = 3600

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/listings', priority: 0.9, changeFrequency: 'daily' },
  { path: '/how-it-works', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/login', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/register', priority: 0.4, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  let listingEntries: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('listings')
      .select('id, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(5000)

    if (error) {
      console.error('[sitemap] supabase error:', error.message)
    } else if (data) {
      listingEntries = data.map((l: { id: string; updated_at: string | null }) => ({
        url: `${SITE_URL}/listings/${l.id}`,
        lastModified: l.updated_at ? new Date(l.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (err: unknown) {
    // Don't break the sitemap if Supabase is unreachable at request time.
    console.error('[sitemap] fetch failed:', err instanceof Error ? err.message : err)
  }

  return [...staticEntries, ...listingEntries]
}
