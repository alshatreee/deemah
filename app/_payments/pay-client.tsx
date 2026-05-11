'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PayClientProps {
  targetId: string
  amount: number
  tapConfigured: boolean
}

export function PayClient({ targetId, amount, tapConfigured }: PayClientProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function startPayment() {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/payments/tap/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'order', targetId }),
        })
        const json = (await res.json()) as { url?: string; error?: string }
        if (!res.ok || !json.url) {
          throw new Error(json.error ?? 'تعذّر بدء الدفع')
        }
        window.location.href = json.url
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'خطأ غير معروف')
      }
    })
  }

  async function devSimulate(success: boolean) {
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/payments/dev-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, success }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'فشلت المحاكاة')
        return
      }
      router.push(`/orders/${targetId}`)
    })
  }

  if (!tapConfigured) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            وضع التطوير: مفاتيح Tap غير معرّفة بعد. استخدمي محاكاة الدفع لإكمال الاختبار.
          </div>
          <div className="flex gap-2">
            <Button disabled={isPending} onClick={() => devSimulate(true)}>
              محاكاة دفع ناجح ({amount} د.ك)
            </Button>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => devSimulate(false)}
            >
              محاكاة فشل
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <p className="text-sm text-muted-foreground">
          سيتم تحويلك إلى Tap لإكمال الدفع بأمان.
        </p>
        <Button disabled={isPending} onClick={startPayment} className="w-full" size="lg">
          {isPending ? 'جارٍ التحويل…' : `ادفعي ${amount.toLocaleString('ar-KW')} د.ك`}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
