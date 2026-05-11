'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { markShippedAction, markDeliveredAction } from '@/app/checkout/actions'
import type { OrderStatus } from '@/lib/types'

interface OrderActionsProps {
  orderId: string
  status: OrderStatus
  isBuyer: boolean
  isSeller: boolean
}

export function OrderActions({ orderId, status, isBuyer, isSeller }: OrderActionsProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canPay = status === 'pending' && isBuyer
  const canMarkShipped = status === 'paid' && isSeller
  const canMarkDelivered = status === 'shipped' && isBuyer

  function run(fn: () => Promise<{ error?: string }>) {
    setError(null)
    startTransition(async () => {
      const r = await fn()
      if (r?.error) setError(r.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {canPay && (
          <Button
            disabled={isPending}
            onClick={() => router.push(`/orders/${orderId}/pay`)}
          >
            ادفعي الآن
          </Button>
        )}
        {canMarkShipped && (
          <Button disabled={isPending} onClick={() => run(() => markShippedAction(orderId))}>
            تم الشحن
          </Button>
        )}
        {canMarkDelivered && (
          <Button disabled={isPending} onClick={() => run(() => markDeliveredAction(orderId))}>
            استلمتُ الطلب
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
