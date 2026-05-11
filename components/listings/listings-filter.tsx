'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SlidersHorizontal, X } from 'lucide-react'

const CATEGORIES = [
  { id: 'women', label: 'نسائي' },
  { id: 'men', label: 'رجالي' },
  { id: 'kids', label: 'أطفال' },
  { id: 'accessories', label: 'إكسسوارات' },
  { id: 'shoes', label: 'أحذية' },
  { id: 'bags', label: 'حقائب' },
] as const

const GENDERS = [
  { id: 'boys', label: 'أولاد' },
  { id: 'girls', label: 'بنات' },
  { id: 'unisex', label: 'للجنسين' },
] as const

const AGE_RANGES = [
  { id: '0-2', label: '٠–٢ سنوات' },
  { id: '3-5', label: '٣–٥ سنوات' },
  { id: '6-9', label: '٦–٩ سنوات' },
  { id: '10-12', label: '١٠–١٢ سنة' },
] as const

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const

interface ListingsFilterProps {
  variant?: 'sidebar' | 'sheet-only'
}

export function ListingsFilter({ variant = 'sidebar' }: ListingsFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const [, startTransition] = useTransition()

  const currentCategory = search.get('category') ?? ''
  const currentSize = search.get('size') ?? ''
  const currentBrand = search.get('brand') ?? ''
  const currentGender = search.get('gender') ?? ''
  const currentAge = search.get('age') ?? ''
  const currentMin = search.get('min') ?? ''
  const currentMax = search.get('max') ?? ''
  const isKids = currentCategory === 'kids'

  const [brand, setBrand] = useState<string>(currentBrand)
  const [minPrice, setMinPrice] = useState<string>(currentMin)
  const [maxPrice, setMaxPrice] = useState<string>(currentMax)

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(search.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key)
      else params.set(key, value)
    }
    params.delete('page')
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  function selectCategory(id: string, checked: boolean) {
    if (checked) {
      navigate({ category: undefined, gender: undefined, age: undefined })
      return
    }
    if (id !== 'kids') {
      navigate({ category: id, gender: undefined, age: undefined })
    } else {
      navigate({ category: id })
    }
  }

  function clearAll() {
    setBrand('')
    setMinPrice('')
    setMaxPrice('')
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasActive =
    !!currentCategory ||
    !!currentSize ||
    !!currentBrand ||
    !!currentGender ||
    !!currentAge ||
    !!currentMin ||
    !!currentMax

  function FilterContent() {
    return (
      <div className="space-y-6">
        <Accordion
          type="multiple"
          defaultValue={['categories', 'price', 'kids']}
          className="w-full"
        >
          <AccordionItem value="categories">
            <AccordionTrigger className="text-base font-semibold">الصنف</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {CATEGORIES.map((c) => {
                  const checked = currentCategory === c.id
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <Checkbox
                        id={`cat-${c.id}`}
                        checked={checked}
                        onCheckedChange={() => selectCategory(c.id, checked)}
                      />
                      <Label
                        htmlFor={`cat-${c.id}`}
                        className="font-normal cursor-pointer"
                      >
                        {c.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {isKids && (
            <AccordionItem value="kids">
              <AccordionTrigger className="text-base font-semibold">
                فلاتر الأطفال
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      النوع
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {GENDERS.map((g) => (
                        <Button
                          key={g.id}
                          variant={currentGender === g.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            navigate({
                              gender: currentGender === g.id ? undefined : g.id,
                            })
                          }
                        >
                          {g.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      العمر
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {AGE_RANGES.map((a) => (
                        <Button
                          key={a.id}
                          variant={currentAge === a.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            navigate({
                              age: currentAge === a.id ? undefined : a.id,
                            })
                          }
                        >
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="price">
            <AccordionTrigger className="text-base font-semibold">
              نطاق السعر (د.ك)
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="min" className="text-xs text-muted-foreground">
                    من
                  </Label>
                  <Input
                    id="min"
                    type="number"
                    min="0"
                    step="0.5"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={() => navigate({ min: minPrice || undefined })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="max" className="text-xs text-muted-foreground">
                    إلى
                  </Label>
                  <Input
                    id="max"
                    type="number"
                    min="0"
                    step="0.5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={() => navigate({ max: maxPrice || undefined })}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sizes">
            <AccordionTrigger className="text-base font-semibold">المقاس</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 pt-2">
                {SIZES.map((s) => (
                  <Button
                    key={s}
                    variant={currentSize === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      navigate({ size: currentSize === s ? undefined : s })
                    }
                    className="min-w-[48px]"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="brand">
            <AccordionTrigger className="text-base font-semibold">الماركة</AccordionTrigger>
            <AccordionContent>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                onBlur={() => navigate({ brand: brand || undefined })}
                placeholder="مثلاً: شانيل"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {hasActive && (
          <Button variant="ghost" onClick={clearAll} className="w-full">
            <X className="h-4 w-4 ml-2" />
            مسح الفلاتر
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'sheet-only') {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <SlidersHorizontal className="h-4 w-4 ml-2" />
            الفلاتر
            {hasActive && (
              <span className="mr-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>فلترة النتائج</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-6">فلترة النتائج</h2>
        <FilterContent />
      </div>
    </aside>
  )
}
