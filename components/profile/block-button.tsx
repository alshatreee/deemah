'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldOff, Shield } from 'lucide-react'
import { blockUserAction, unblockUserAction } from '@/app/profile/[username]/block-actions'

interface BlockButtonProps {
  targetId: string
  initiallyBlocked: boolean
}

export function BlockButton({ targetId, initiallyBlocked }: BlockButtonProps) {
  const [isBlocked, setIsBlocked] = useState(initiallyBlocked)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    setError(null)
    startTransition(async () => {
      const result = isBlocked
        ? await unblockUserAction(targetId)
        : await blockUserAction(targetId)
      if (result.error) setError(result.error)
      else setIsBlocked((prev) => !prev)
    })
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        className={isBlocked ? 'text-destructive hover:text-destructive' : 'text-muted-foreground'}
        title={isBlocked ? 'إلغاء الحظر' : 'حظر المستخدمة'}
      >
        {isBlocked
          ? <><Shield className="h-4 w-4 ml-1" />إلغاء الحظر</>
          : <><ShieldOff className="h-4 w-4 ml-1" />حظر</>}
      </Button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}
