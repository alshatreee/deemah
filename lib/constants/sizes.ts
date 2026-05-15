// Size catalogs by category. Used by the size-picker UI and validation.

export const CLOTHING_SIZES = [
  'One Size',
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
] as const

// EU shoe sizes (popular range for KW market)
export const SHOE_SIZES_EU = [
  '35',
  '35.5',
  '36',
  '36.5',
  '37',
  '37.5',
  '38',
  '38.5',
  '39',
  '39.5',
  '40',
  '40.5',
  '41',
  '41.5',
  '42',
  '42.5',
  '43',
  '44',
  '45',
  '46',
] as const

// Kids sizes
export const KIDS_SIZES_MONTHS = [
  '0-3m',
  '3-6m',
  '6-9m',
  '9-12m',
  '12-18m',
  '18-24m',
] as const

export const KIDS_SIZES_YEARS = [
  '2y',
  '3y',
  '4y',
  '5y',
  '6y',
  '7y',
  '8y',
  '10y',
  '12y',
  '14y',
  '16y',
] as const

export function sizesForCategory(category: string | null | undefined): readonly string[] {
  switch (category) {
    case 'shoes':
      return SHOE_SIZES_EU
    case 'kids':
      return [...KIDS_SIZES_MONTHS, ...KIDS_SIZES_YEARS]
    case 'bags':
    case 'accessories':
      return ['One Size']
    default:
      return CLOTHING_SIZES
  }
}
