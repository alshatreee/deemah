'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { submitReviewAction } from './review-actions'

export function ReviewForm({ orderId, listingId, sellerId }: { orderId: string; listingId: string; sellerId: string }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('orderId', orderId)
      fd.set('listingId', listingId)
      fd.set('targetId', sellerId)
      fd.set('rating', String(rating))
      fd.set('comment', comment)
      const r = await submitReviewAction(fd)
      if (r?.error) setError(r.error)
      else setDone(true)
    })
  }

  if (done) {
    return <p className="text-sm text-green-700">شكراً على تقييمك!</p>
  }

  return (
    <div dir="rtl" className="rounded-md border p-4">
      <h3 className="font-bold mb-2">قيّمي تجربتك</h3>
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            aria-label={`${n} نجوم`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="تعليقك (اختياري)"
        className="w-full rounded-md border px-3 py-2 text-sm mb-2"
      />
      {error && <p className="text-sm text-destructive mb-2">{error}</p>}
      <Button size="sm" disabled={pending} onClick={submit}>
        {pending ? 'جاري الإرسال...' : 'إرسال التقييم'}
      </Button>
    </div>
  )
}
