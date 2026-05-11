import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { requireUser } from '@/lib/auth'
import { fetchConversations } from '@/lib/messages'

export const dynamic = 'force-dynamic'

function relTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ar })
  } catch {
    return ''
  }
}

export default async function MessagesPage() {
  const user = await requireUser()
  const conversations = await fetchConversations(user.id)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">الرسائل</h1>

        {conversations.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">لا توجد محادثات بعد</p>
            <Link href="/listings" className="text-primary text-sm mt-2 inline-block">
              تصفّحي القطع وابدئي محادثة
            </Link>
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl">
            {conversations.map((c) => (
              <Link key={c.partner_id} href={`/messages/${c.partner_id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden relative shrink-0">
                      {c.partner?.avatar_url && (
                        <Image src={c.partner.avatar_url} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-semibold truncate">
                          {c.partner?.full_name ?? c.partner?.username ?? 'مستخدمة'}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {relTime(c.last_message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {c.last_message.body}
                      </p>
                    </div>
                    {c.unread_count > 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        {c.unread_count}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
