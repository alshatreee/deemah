'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { setSellerStatusAction } from './actions'

const STATUS_LABEL: Record<string, string> = {
  approved: 'مقبولة',
  pending: 'قيد المراجعة',
  suspended: 'معلّقة',
  banned: 'محظورة',
}

interface UserRowProps {
  user: {
    id: string
    username: string | null
    full_name: string | null
    role: string
    seller_status: string
    rating: number
  }
}

export function UserRow({ user }: UserRowProps) {
  const [pending, startTransition] = useTransition()

  function changeStatus(status: string) {
    startTransition(async () => {
      const result = await setSellerStatusAction(user.id, status)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <tr className="border-t">
      <td className="p-3">{user.full_name || '-'}</td>
      <td className="p-3 font-mono text-xs">{user.username || '-'}</td>
      <td className="p-3">
        <span className={`rounded-full px-2 py-1 text-xs ${
          user.seller_status === 'approved' ? 'bg-green-100 text-green-800' :
          user.seller_status === 'banned' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {STATUS_LABEL[user.seller_status] || user.seller_status}
        </span>
        {user.role === 'admin' && <span className="ml-2 text-xs text-primary">(مديرة)</span>}
      </td>
      <td className="p-3">{user.rating?.toFixed(1) || '-'}</td>
      <td className="p-3 flex gap-2">
        {user.seller_status !== 'approved' && (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => changeStatus('approved')}>
            موافقة
          </Button>
        )}
        {user.seller_status !== 'suspended' && (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => changeStatus('suspended')}>
            تعليق
          </Button>
        )}
        {user.seller_status !== 'banned' && (
          <Button size="sm" variant="destructive" disabled={pending} onClick={() => changeStatus('banned')}>
            حظر
          </Button>
        )}
      </td>
    </tr>
  )
}
