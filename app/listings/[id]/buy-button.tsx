'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface BuyButtonProps {
  listingId: string
  loggedIn: boolean
}

export function BuyButton({ listingId, loggedIn }: BuyButtonProps) {
  const router = useRouter()
  return (
    <Button
      className="w-full"
      size="lg"
      onClick={() => {
        if (!loggedIn) {
          router.push(`/login?redirectTo=/listings/${listingId}`)
          return
        }
        router.push(`/checkout/${listingId}`)
      }}
    >
      اشتري الآن
    </Button>
  )
}
