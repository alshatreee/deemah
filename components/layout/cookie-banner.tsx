'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'deemah_cookie_consent_v1'

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (!consent) setShow(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setShow(false)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      role="region"
      aria-label="موافقة الكوكيز"
      dir="rtl"
      className="fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur p-4 shadow-lg"
    >
      <div className="container mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-foreground">
          نستخدم الكوكيز لتحسين تجربتك. بالاستمرار، توافقين على{' '}
          <Link href="/terms" className="underline text-primary">
            الشروط والأحكام
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={decline}>
            رفض
          </Button>
          <Button size="sm" onClick={accept}>
            موافقة
          </Button>
        </div>
      </div>
    </div>
  )
}
