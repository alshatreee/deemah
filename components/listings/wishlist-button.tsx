'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleWishlistAction } from '@/app/wishlist/actions'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  listingId: string
  initialInWishlist: boolean
  className?: string
}

export function WishlistButton({ listingId, initialInWishlist, className }: WishlistButtonProps) {
  const [inList, setInList] = useState(initialInWishlist)
  const [pending, startTransition] = useTransition()

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const result = await toggleWishlistAction(listingId)
      if (result.error) {
        alert(result.error)
        return
      }
      if (typeof result.added === 'boolean') setInList(result.added)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={inList ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-2 transition',
        inList ? 'bg-primary text-white' : 'bg-white/90 text-foreground hover:bg-white',
        className,
      )}
    >
      <Heart className={cn('h-5 w-5', inList && 'fill-current')} />
    </button>
  )
}
