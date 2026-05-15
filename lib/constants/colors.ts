// Standardized color palette (id is stored in DB)
export const COLORS = [
  { id: 'black', label: 'أسود', hex: '#000000' },
  { id: 'white', label: 'أبيض', hex: '#FFFFFF' },
  { id: 'beige', label: 'بيج', hex: '#F5F5DC' },
  { id: 'brown', label: 'بني', hex: '#895129' },
  { id: 'red', label: 'أحمر', hex: '#FF0000' },
  { id: 'pink', label: 'وردي', hex: '#FFC0CB' },
  { id: 'orange', label: 'برتقالي', hex: '#FFBF00' },
  { id: 'yellow', label: 'أصفر', hex: '#FFE547' },
  { id: 'green', label: 'أخضر', hex: '#0E9F4A' },
  { id: 'blue', label: 'أزرق', hex: '#0047AB' },
  { id: 'purple', label: 'بنفسجي', hex: '#800080' },
  { id: 'burgundy', label: 'برغندي', hex: '#800020' },
  { id: 'gold', label: 'ذهبي', hex: '#FFD700' },
  { id: 'silver', label: 'فضي', hex: '#C4C4C4' },
  { id: 'rose_gold', label: 'روز جولد', hex: '#DEA193' },
  { id: 'gray', label: 'رمادي', hex: '#808080' },
  { id: 'navy', label: 'كحلي', hex: '#0a1f44' },
  { id: 'natural', label: 'طبيعي', hex: '#e8d6c8' },
  { id: 'multi', label: 'ملوّن', hex: 'linear-gradient(45deg,#f06,#06f,#0f6,#fc0)' },
] as const

export type ColorId = (typeof COLORS)[number]['id']

export function colorById(id: string | null | undefined) {
  if (!id) return null
  return COLORS.find((c) => c.id === id) ?? null
}

export function isValidColor(v: string | null | undefined): v is ColorId {
  if (!v) return false
  return COLORS.some((c) => c.id === v)
}
