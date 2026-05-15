// Kuwait governorates - matches enum public.kw_area
export const KW_AREAS = [
  { id: 'capital', label: 'العاصمة' },
  { id: 'hawalli', label: 'حولي' },
  { id: 'farwaniya', label: 'الفروانية' },
  { id: 'mubarak', label: 'مبارك الكبير' },
  { id: 'ahmadi', label: 'الأحمدي' },
  { id: 'jahra', label: 'الجهراء' },
] as const

export type KwArea = (typeof KW_AREAS)[number]['id']

export function isValidArea(v: string | undefined | null): v is KwArea {
  if (!v) return false
  return KW_AREAS.some((a) => a.id === v)
}

export function areaLabel(id: string | null | undefined): string | null {
  if (!id) return null
  const found = KW_AREAS.find((a) => a.id === id)
  return found?.label ?? null
}
