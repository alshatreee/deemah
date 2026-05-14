import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { fetchNotifications } from '@/lib/notifications'
import { markAllReadAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/notifications')

  const items = await fetchNotifications(user.id)

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          <form action={markAllReadAction}>
            <Button type="submit" variant="outline" size="sm">تعليم كمقروء</Button>
          </form>
        </div>
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">لا توجد إشعارات</p>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li key={n.id} className={`rounded-lg border p-4 ${!n.read_at ? 'bg-primary/5 border-primary/20' : ''}`}>
                {n.link ? (
                  <Link href={n.link} className="block">
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="text-sm text-muted-foreground mt-1">{n.body}</p>}
                  </Link>
                ) : (
                  <>
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="text-sm text-muted-foreground mt-1">{n.body}</p>}
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(n.created_at).toLocaleString('ar-KW')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  )
}
