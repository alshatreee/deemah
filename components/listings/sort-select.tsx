'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const OPTIONS = [
  { id: 'featured', label: 'المميّز' },
  { id: 'newest', label: 'الأحدث' },
  { id: 'popular', label: 'الأكثر مشاهدة' },
  { id: 'price_asc', label: 'الأقل سعراً' },
  { id: 'price_desc', label: 'الأعلى سعراً' },
] as const

export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const [, startTransition] = useTransition()
  const current = search.get('sort') ?? 'newest'

  function onChange(value: string) {
    const params = new URLSearchParams(search.toString())
    if (value === 'newest') params.delete('sort')
    else params.set('sort', value)
    params.delete('page')
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] h-10">
        <SelectValue placeholder="الترتيب" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
