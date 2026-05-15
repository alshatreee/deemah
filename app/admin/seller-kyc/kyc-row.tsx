'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ShieldCheck, ShieldOff } from 'lucide-react'
import { approveKycAction, rejectKycAction, revokeKycAction } from './actions'

interface KycRowProps {
  user: {
    id: string
    username: string | null
    full_name: string | null
    kyc_full_name: string | null
    kyc_phone: string | null
    kyc_doc_url?: string | null
    kyc_submitted_at?: string | null
    authenticated_at?: string | null
  }
  mode: 'pending' | 'verified'
}

export function KycRow({ user, mode }: KycRowProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function act(fn: (id: string) => Promise<{ error?: string }>) {
    setError(null)
    startTransition(async () => {
      const r = await fn(user.id)
      if (r?.error) setError(r.error)
    })
  }

  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <p className="font-semibold">
            {user.kyc_full_name || user.full_name || user.username || user.id}
          </p>
          <p className="text-sm text-muted-foreground">@{user.username ?? '—'}</p>
          {user.kyc_phone && (
            <p className="text-sm text-muted-foreground">📞 {user.kyc_phone}</p>
          )}
          {user.kyc_submitted_at && (
            <p className="text-xs text-muted-foreground mt-1">
              قُدّم: {new Date(user.kyc_submitted_at).toLocaleDateString('ar-KW')}
            </p>
          )}
          {user.authenticated_at && (
            <p className="text-xs text-emerald-700 mt-1">
              ✓ وُثّق: {new Date(user.authenticated_at).toLocaleDateString('ar-KW')}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {mode === 'pending' && (
            <>
              {user.kyc_doc_url && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`/api/admin/kyc-doc?path=${encodeURIComponent(user.kyc_doc_url)}`}
                    target="_blank"
                    rel="noopener"
                  >
                    عرض الهوية
                  </a>
                </Button>
              )}
              <Button
                size="sm"
                disabled={pending}
                onClick={() => act(approveKycAction)}
              >
                <CheckCircle2 className="h-4 w-4 ml-1" />
                موافقة
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={pending}
                onClick={() => act(rejectKycAction)}
              >
                <XCircle className="h-4 w-4 ml-1" />
                رفض
              </Button>
            </>
          )}
          {mode === 'verified' && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => act(revokeKycAction)}
            >
              <ShieldOff className="h-4 w-4 ml-1" />
              سحب التوثيق
            </Button>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  )
}
