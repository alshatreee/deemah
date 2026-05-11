'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface UserNavProps {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

export function UserNav({ variant = 'desktop', onNavigate }: UserNavProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) return null

  const wrapperClass =
    variant === 'desktop'
      ? 'hidden md:flex items-center gap-3'
      : 'flex flex-col gap-3 pt-4 border-t'

  if (user) {
    return (
      <div className={wrapperClass}>
        <Button
          variant={variant === 'desktop' ? 'ghost' : 'outline'}
          size={variant === 'desktop' ? 'sm' : 'default'}
          asChild
        >
          <Link href="/dashboard" onClick={onNavigate}>
            لوحتي
          </Link>
        </Button>
        <form action="/api/auth/signout" method="post">
          <Button
            type="submit"
            variant="outline"
            size={variant === 'desktop' ? 'sm' : 'default'}
            className={variant === 'mobile' ? 'w-full' : ''}
          >
            خروج
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <Button
        variant={variant === 'desktop' ? 'ghost' : 'outline'}
        size={variant === 'desktop' ? 'sm' : 'default'}
        asChild
      >
        <Link href="/login" onClick={onNavigate}>
          دخول
        </Link>
      </Button>
      <Button size={variant === 'desktop' ? 'sm' : 'default'} asChild>
        <Link href="/register" onClick={onNavigate}>
          تسجيل
        </Link>
      </Button>
    </div>
  )
}
