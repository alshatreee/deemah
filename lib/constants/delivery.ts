export const DELIVERY_METHODS = [
  { id: 'meet_in_person', label: 'لقاء وجهاً لوجه' },
  { id: 'seller_delivery', label: 'توصيل من البائعة' },
  { id: 'courier', label: 'شركة شحن' },
] as const

export type DeliveryMethodId = (typeof DELIVERY_METHODS)[number]['id']

export function deliveryMethodLabel(id: string | null | undefined): string | null {
  if (!id) return null
  return DELIVERY_METHODS.find((m) => m.id === id)?.label ?? null
}
