'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function NotificationBell() {
  const [userId, setUserId] = useState<string | null>(null)
  const [count, setCount] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function load(uid: string) {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .is('read_at', null)
      if (active) setCount(count ?? 0)
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      const uid = data.user?.id ?? null
      setUserId(uid)
      setReady(true)
      if (uid) void load(uid)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const uid = session?.user?.id ?? null
      setUserId(uid)
      if (uid) void load(uid)
      else setCount(0)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (!ready || !userId) return null

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
      aria-label="الإشعارات"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-destructive text-white text-xs h-5 min-w-[1.25rem] px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
