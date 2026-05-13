'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
      <div className="max-w-md text-center px-4">
        <h2 className="text-2xl font-bold text-foreground">حدث خطأ غير متوقع</h2>
        <p className="mt-2 text-muted-foreground">نعتذر، حصلت مشكلة في تحميل الصفحة. تم إبلاغ فريقنا.</p>
        <Button onClick={reset} className="mt-6">
          حاولي مرة أخرى
        </Button>
      </div>
    </div>
  )
}
