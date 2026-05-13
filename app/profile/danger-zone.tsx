'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function DangerZone() {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const router = useRouter()

  async function handleDelete() {
    if (confirmText !== 'حذف') return
    if (!confirm('هذا الإجراء نهائي. هل أنت متأكدة؟')) return
    setLoading(true)
    const res = await fetch('/api/account/delete', { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      router.push('/')
    } else {
      const body = await res.json()
      alert(body.error || 'فشل حذف الحساب')
    }
  }

  return (
    <section dir="rtl" className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 p-6">
      <h3 className="text-lg font-bold text-destructive">منطقة الخطر</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        حذف الحساب نهائي. سيتم حذف جميع منتجاتك وطلباتك ورسائلك ولا يمكن استرجاعها.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="اكتبي 'حذف' للتأكيد"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <Button
          variant="destructive"
          disabled={confirmText !== 'حذف' || loading}
          onClick={handleDelete}
        >
          {loading ? 'جاري الحذف...' : 'حذف حسابي نهائياً'}
        </Button>
      </div>
    </section>
  )
}
