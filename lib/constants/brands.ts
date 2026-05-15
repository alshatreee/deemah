// Popular brands for the Kuwaiti luxury second-hand market.
// Stored as `brand` text on listings. Use slug for filter URLs, label for display.
export const POPULAR_BRANDS = [
  { slug: 'chanel', label: 'شانيل', tier: 'luxury' },
  { slug: 'louis_vuitton', label: 'لويس فويتون', tier: 'luxury' },
  { slug: 'hermes', label: 'هيرميس', tier: 'luxury' },
  { slug: 'gucci', label: 'غوتشي', tier: 'luxury' },
  { slug: 'dior', label: 'ديور', tier: 'luxury' },
  { slug: 'prada', label: 'برادا', tier: 'luxury' },
  { slug: 'valentino', label: 'فالنتينو', tier: 'luxury' },
  { slug: 'fendi', label: 'فندي', tier: 'luxury' },
  { slug: 'celine', label: 'سيلين', tier: 'luxury' },
  { slug: 'ysl', label: 'إيف سان لوران', tier: 'luxury' },
  { slug: 'bottega_veneta', label: 'بوتيغا فينيتا', tier: 'luxury' },
  { slug: 'balenciaga', label: 'بالنسياغا', tier: 'luxury' },
  { slug: 'givenchy', label: 'جيفنشي', tier: 'luxury' },
  { slug: 'loewe', label: 'لوي', tier: 'luxury' },
  { slug: 'elie_saab', label: 'إيلي صعب', tier: 'designer' },
  { slug: 'zimmermann', label: 'زيمرمان', tier: 'designer' },
  { slug: 'stella_mccartney', label: 'ستيلا مكارتني', tier: 'designer' },
  { slug: 'tory_burch', label: 'توري بورتش', tier: 'designer' },
  { slug: 'off_white', label: 'أوف وايت', tier: 'designer' },
  { slug: 'palm_angels', label: 'بالم انجلز', tier: 'designer' },
  { slug: 'self_portrait', label: 'سيلف بورتريت', tier: 'designer' },
  { slug: 'rotate', label: 'روتيت', tier: 'designer' },
  { slug: 'jacquemus', label: 'جاكموس', tier: 'designer' },
  { slug: 'maje', label: 'ماجيه', tier: 'designer' },
  { slug: 'sandro', label: 'ساندرو', tier: 'designer' },
  { slug: 'coach', label: 'كوتش', tier: 'designer' },
  { slug: 'mk', label: 'مايكل كورس', tier: 'premium' },
  { slug: 'kate_spade', label: 'كيت سبايد', tier: 'premium' },
  { slug: 'dima_ayad', label: 'ديما عياد', tier: 'local' },
  { slug: 'karen_wazen', label: 'كارن وازن', tier: 'local' },
  { slug: 'andrea_wazen', label: 'أندريا وازن', tier: 'local' },
  { slug: 'zara', label: 'زارا', tier: 'high_street' },
  { slug: 'hm', label: 'إتش آند إم', tier: 'high_street' },
  { slug: 'mango', label: 'مانجو', tier: 'high_street' },
] as const

export type BrandSlug = (typeof POPULAR_BRANDS)[number]['slug']

export function brandLabel(slugOrFree: string | null | undefined): string | null {
  if (!slugOrFree) return null
  const found = POPULAR_BRANDS.find(
    (b) => b.slug === slugOrFree || b.label === slugOrFree,
  )
  return found?.label ?? slugOrFree
}

export function findBrand(q: string): typeof POPULAR_BRANDS[number][] {
  if (!q) return [...POPULAR_BRANDS]
  const lower = q.toLowerCase()
  return POPULAR_BRANDS.filter(
    (b) =>
      b.label.includes(q) ||
      b.slug.toLowerCase().includes(lower),
  )
}
