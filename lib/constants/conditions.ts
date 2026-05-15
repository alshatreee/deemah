// Listing conditions - matches DB enum-like text.
export const CONDITIONS = [
  { id: 'new', label: 'جديد بالتغليف', tone: 'success' },
  { id: 'like_new', label: 'ممتاز', tone: 'success' },
  { id: 'good', label: 'جيد جداً', tone: 'info' },
  { id: 'fair', label: 'جيد', tone: 'neutral' },
] as const

export type ConditionId = (typeof CONDITIONS)[number]['id']

export function conditionMeta(id: string | null | undefined) {
  if (!id) return null
  return CONDITIONS.find((c) => c.id === id) ?? null
}
