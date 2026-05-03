"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SlidersHorizontal, X } from "lucide-react"

const categories = [
  { id: "dresses", label: "فساتين" },
  { id: "abayas", label: "عبايات" },
  { id: "bags", label: "حقائب" },
  { id: "shoes", label: "أحذية" },
  { id: "accessories", label: "إكسسوارات" },
  { id: "jewelry", label: "مجوهرات" },
]

const conditions = [
  { id: "new", label: "جديد" },
  { id: "excellent", label: "ممتاز" },
  { id: "good", label: "جيد" },
]

const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

export interface FilterCounts {
  type?: { all?: number; rent?: number; sale?: number }
  categories?: Record<string, number>
  conditions?: Record<string, number>
  sizes?: Record<string, number>
}

interface ListingsFilterProps {
  onFilterChange?: (filters: FilterState) => void
  counts?: FilterCounts
}

interface FilterState {
  type: "all" | "rent" | "sale"
  categories: string[]
  conditions: string[]
  sizes: string[]
  priceRange: [number, number]
}

function CountChip({ n }: { n?: number }) {
  if (typeof n !== "number") return null
  return (
    <span className="text-xs text-muted-foreground tabular-nums">({n})</span>
  )
}

export function ListingsFilter({ onFilterChange, counts }: ListingsFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    categories: [],
    conditions: [],
    sizes: [],
    priceRange: [0, 500],
  })

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const toggleArrayFilter = (
    key: "categories" | "conditions" | "sizes",
    value: string
  ) => {
    const current = filters[key]
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    updateFilter(key, newValue)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      type: "all",
      categories: [],
      conditions: [],
      sizes: [],
      priceRange: [0, 500],
    }
    setFilters(defaultFilters)
    onFilterChange?.(defaultFilters)
  }

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.categories.length > 0 ||
    filters.conditions.length > 0 ||
    filters.sizes.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 500

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Type Filter */}
      <div>
        <Label className="text-base font-semibold mb-3 block">النوع</Label>
        <div className="flex gap-2">
          {[
            { value: "all", label: "الكل", count: counts?.type?.all },
            { value: "rent", label: "للإيجار", count: counts?.type?.rent },
            { value: "sale", label: "للبيع", count: counts?.type?.sale },
          ].map((option) => (
            <Button
              key={option.value}
              variant={filters.type === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("type", option.value as FilterState["type"])}
              className="gap-1.5"
            >
              <span>{option.label}</span>
              {typeof option.count === "number" && (
                <span className="text-xs opacity-80 tabular-nums">
                  ({option.count})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["categories", "price"]} className="w-full">
        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger className="text-base font-semibold">الفئة</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-3">
                  <Checkbox
                    id={category.id}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => toggleArrayFilter("categories", category.id)}
                  />
                  <Label htmlFor={category.id} className="font-normal cursor-pointer flex-1 flex items-center justify-between">
                    <span>{category.label}</span>
                    <CountChip n={counts?.categories?.[category.id]} />
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-semibold">نطاق السعر</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
                max={500}
                step={10}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.priceRange[0]} د.ك</span>
                <span>{filters.priceRange[1]} د.ك</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sizes */}
        <AccordionItem value="sizes">
          <AccordionTrigger className="text-base font-semibold">المقاس</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {sizes.map((size) => {
                const c = counts?.sizes?.[size]
                return (
                  <Button
                    key={size}
                    variant={filters.sizes.includes(size) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter("sizes", size)}
                    className="min-w-[48px] gap-1"
                  >
                    <span>{size}</span>
                    {typeof c === "number" && (
                      <span className="text-[10px] opacity-70 tabular-nums">
                        ({c})
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Condition */}
        <AccordionItem value="condition">
          <AccordionTrigger className="text-base font-semibold">الحالة</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {conditions.map((condition) => (
                <div key={condition.id} className="flex items-center gap-3">
                  <Checkbox
                    id={condition.id}
                    checked={filters.conditions.includes(condition.id)}
                    onCheckedChange={() => toggleArrayFilter("conditions", condition.id)}
                  />
                  <Label htmlFor={condition.id} className="font-normal cursor-pointer flex-1 flex items-center justify-between">
                    <span>{condition.label}</span>
                    <CountChip n={counts?.conditions?.[condition.id]} />
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 ml-2" />
          مسح الفلاتر
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden">
            <SlidersHorizontal className="h-4 w-4 ml-2" />
            الفلاتر
            {hasActiveFilters && (
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

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-card rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-6">فلترة النتائج</h2>
          <FilterContent />
        </div>
      </aside>
    </>
  )
}
