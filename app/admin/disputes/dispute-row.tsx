'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { resolveDisputeAction } from './actions'

const STATUS_LABEL: Record<string, string> = {
  open: 'مفتوح',
  reviewing: 'قيد المراجعة',
  resolved_refund: 'استرداد',
  resolved_release: 'تحرير',
  closed: 'مغلق',
}

interface DisputeRowProps {
  dispute: {
    id: string
    order_id: string
    reason: string
    description: string | null
    status: string
    resolution_note: string | null
  }
}

export function DisputeRow({ dispute }: DisputeRowProps) {
  const [note, setNote] = useState(dispute.resolution_note || '')
  const [pending, startTransition] = useTransition()

  function resolve(status: string) {
    if (!note.trim()) {
      alert('يرجى إدخال ملاحظة الحل')
      return
    }
    startTransition(async () => {
      const r = await resolveDisputeAction(dispute.id, status, note.trim())
      if (r?.error) alert(r.error)
    })
  }

  const isClosed =
    dispute.status === 'resolved_refund' ||
    dispute.status === 'resolved_release' ||
    dispute.status === 'closed'

  return (
    <tr className="border-t align-top">
      <td className="p-3">
        <Link href={`/orders/${dispute.order_id}`} className="hover:underline font-mono text-xs">
          {dispute.order_id.slice(0, 8)}
        </Link>
      </td>
      <td className="p-3">{dispute.reason}</td>
      <td className="p-3 max-w-xs">{dispute.description || '-'}</td>
      <td className="p-3">{STATUS_LABEL[dispute.status] || dispute.status}</td>
      <td className="p-3 space-y-2">
        {!isClosed && (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="ملاحظة الحل (مطلوبة)"
              className="w-full rounded-md border px-2 py-1 text-xs"
            />
            <div className="flex gap-1 flex-wrap">
              <Button size="sm" variant="outline" disabled={pending} onClick={() => resolve('resolved_refund')}>
                استرداد
              </Button>
              <Button size="sm" variant="outline" disabled={pending} onClick={() => resolve('resolved_release')}>
                تحرير
              </Button>
              <Button size="sm" variant="destructive" disabled={pending} onClick={() => resolve('closed')}>
                إغلاق
              </Button>
            </div>
          </>
        )}
        {isClosed && dispute.resolution_note && (
          <p className="text-xs text-muted-foreground">{dispute.resolution_note}</p>
        )}
      </td>
    </tr>
  )
}
