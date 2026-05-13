'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { openDisputeAction } from './dispute-actions'

const REASONS = [
  { value: 'not_received', label: 'لم يصل الطلب' },
  { value: 'damaged', label: 'وصل تالفاً' },
  { value: 'not_as_described', label: 'مختلف عن الوصف' },
  { value: 'other', label: 'سبب آخر' },
]

export function DisputeForm({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await openDisputeAction(formData)
      if (result.error) setError(result.error)
      else {
        setSuccess(true)
        setOpen(false)
      }
    })
  }

  if (success) {
    return (
      <div dir="rtl" className="rounded-md border border-green-500/30 bg-green-500/10 p-4">
        <p className="text-sm text-green-700">تم فتح النزاع. سنراجعه خلال 48 ساعة.</p>
      </div>
    )
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        طلب استرداد / فتح نزاع
      </Button>
    )
  }

  return (
    <form action={handleSubmit} dir="rtl" className="space-y-3 rounded-md border p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label className="block text-sm font-medium mb-1">سبب النزاع</label>
        <select name="reason" required className="w-full rounded-md border px-3 py-2 text-sm">
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">تفاصيل (10-2000 حرف)</label>
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="اشرحي ما حصل بالتفصيل..."
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} size="sm">
          {pending ? 'جاري الإرسال...' : 'إرسال'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
