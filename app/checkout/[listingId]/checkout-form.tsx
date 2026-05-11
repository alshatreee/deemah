'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createOrderAction } from '../actions'

interface CheckoutFormProps {
  listingId: string
  defaults: { full_name: string; phone: string; city: string }
}

export function CheckoutForm({ listingId, defaults }: CheckoutFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createOrderAction(listingId, formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-lg border p-4">
      <h2 className="font-semibold">عنوان التوصيل</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="full_name">الاسم الكامل</Label>
          <Input id="full_name" name="full_name" required defaultValue={defaults.full_name} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">الهاتف</Label>
          <Input id="phone" name="phone" required dir="ltr" defaultValue={defaults.phone} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="city">المدينة</Label>
          <Input id="city" name="city" required defaultValue={defaults.city} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="area">المنطقة</Label>
          <Input id="area" name="area" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="block">القطعة</Label>
          <Input id="block" name="block" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="street">الشارع</Label>
          <Input id="street" name="street" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="building">المنزل/المبنى</Label>
          <Input id="building" name="building" required />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="notes">ملاحظات (اختياري)</Label>
          <Textarea id="notes" name="notes" rows={2} />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending} className="w-full" size="lg">
        {isPending ? 'جارٍ الإنشاء…' : 'تأكيد ومتابعة الدفع'}
      </Button>
    </form>
  )
}
