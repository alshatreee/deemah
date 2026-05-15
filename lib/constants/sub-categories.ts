// Sub-categories grouped by main category (matches IA from Bloomingdales / Ounass).
export const SUB_CATEGORIES: Record<string, { id: string; label: string }[]> = {
  women: [
    { id: 'dresses', label: 'فساتين' },
    { id: 'abayas', label: 'عبايات' },
    { id: 'tops', label: 'بلوزات' },
    { id: 'skirts', label: 'تنانير' },
    { id: 'pants', label: 'بناطيل' },
    { id: 'jeans', label: 'جينز' },
    { id: 'outerwear', label: 'معاطف وجاكيتات' },
    { id: 'knitwear', label: 'تريكو' },
    { id: 'activewear', label: 'رياضية' },
    { id: 'sleepwear', label: 'منامات' },
    { id: 'beachwear', label: 'ملابس بحر' },
    { id: 'lingerie', label: 'داخلية' },
    { id: 'evening', label: 'سهرة' },
    { id: 'jumpsuits', label: 'بدلات' },
  ],
  men: [
    { id: 'shirts', label: 'قمصان' },
    { id: 'tshirts', label: 'تيشيرتات' },
    { id: 'pants', label: 'بناطيل' },
    { id: 'jeans', label: 'جينز' },
    { id: 'suits', label: 'بدل' },
    { id: 'outerwear', label: 'جاكيتات' },
    { id: 'activewear', label: 'رياضية' },
    { id: 'sweaters', label: 'سترات' },
    { id: 'thobes', label: 'دشاديش' },
  ],
  kids: [
    { id: 'tops', label: 'بلوزات' },
    { id: 'bottoms', label: 'بناطيل' },
    { id: 'dresses', label: 'فساتين' },
    { id: 'outerwear', label: 'جاكيتات' },
    { id: 'sleepwear', label: 'بيجامات' },
    { id: 'sets', label: 'أطقم' },
  ],
  shoes: [
    { id: 'heels', label: 'كعب عالي' },
    { id: 'flats', label: 'مسطحة' },
    { id: 'sandals', label: 'صنادل' },
    { id: 'sneakers', label: 'سنيكرز' },
    { id: 'boots', label: 'بوتس' },
    { id: 'slip_on', label: 'سهلة الارتداء' },
  ],
  bags: [
    { id: 'shoulder', label: 'حقيبة كتف' },
    { id: 'cross_body', label: 'كروس' },
    { id: 'tote', label: 'حقيبة كبيرة' },
    { id: 'clutch', label: 'كلاتش' },
    { id: 'top_handle', label: 'يد علوية' },
    { id: 'backpack', label: 'ظهر' },
    { id: 'mini', label: 'صغيرة/ميني' },
  ],
  accessories: [
    { id: 'sunglasses', label: 'نظارات شمسية' },
    { id: 'jewelry', label: 'مجوهرات' },
    { id: 'watches', label: 'ساعات' },
    { id: 'belts', label: 'أحزمة' },
    { id: 'hats', label: 'قبعات' },
    { id: 'scarves', label: 'أوشحة' },
  ],
}

export function subCategoriesFor(category: string | null | undefined) {
  if (!category) return []
  return SUB_CATEGORIES[category] ?? []
}

export function subCategoryLabel(category: string | null | undefined, id: string | null | undefined) {
  if (!category || !id) return null
  const list = SUB_CATEGORIES[category] ?? []
  return list.find((s) => s.id === id)?.label ?? null
}
