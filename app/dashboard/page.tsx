import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, MessageSquare, Wallet, Eye, Pencil, Package } from 'lucide-react'
import { requireUser, getProfile } from '@/lib/auth'
import { fetchUserListings } from '@/lib/listings'
import { fetchConversations } from '@/lib/messages'
import { createClient } from '@/lib/supabase/server'
import { listingPublicUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'

interface EarningsSummary {
  total: number
  pending: number
}

async function fetchEarnings(userId: string): Promise<EarningsSummary> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, status, type')
    .eq('user_id', userId)
    .in('type', ['earning', 'payout'])
  if (error) {
    console.error('[fetchEarnings] error:', error.message)
    return { total: 0, pending: 0 }
  }
  let total = 0
  let pending = 0
  for (const t of data ?? []) {
    const amt = Number(t.amount ?? 0)
    if (t.type === 'earning' && t.status === 'completed') total += amt
    if (t.status === 'pending') pending += amt
  }
  return { total, pending }
}

export default async function DashboardPage() {
  const user = await requireUser()
  const profile = await getProfile()
  const [listings, conversations, earnings] = await Promise.all([
    fetchUserListings(user.id),
    fetchConversations(user.id),
    fetchEarnings(user.id),
  ])

  const unreadTotal = conversations.reduce((s, c) => s + c.unread_count, 0)
  const activeCount = listings.filter((l) => l.status === 'active').length
  const totalViews = listings.reduce((s, l) => s + (l.views_count ?? 0), 0)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              مرحباً، {profile?.full_name ?? profile?.username ?? 'بائعة'}
            </h1>
            <p className="text-muted-foreground mt-1">لوحتك الشخصية</p>
          </div>
          <Link href="/listings/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              قطعة جديدة
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">قطع نشطة</p>
              <p className="text-2xl font-bold mt-1">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">المشاهدات</p>
              <p className="text-2xl font-bold mt-1 flex items-center gap-1">
                <Eye className="h-5 w-5 text-muted-foreground" />
                {totalViews}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">رسائل غير مقروءة</p>
              <p className="text-2xl font-bold mt-1 flex items-center gap-1">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                {unreadTotal}
              </p>
            </CardContent>
          </Card>
          <Link href="/dashboard/earnings">
            <Card className="hover:bg-muted/40 transition">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">الأرباح (د.ك)</p>
                <p className="text-2xl font-bold mt-1 flex items-center gap-1">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  {earnings.total.toLocaleString('ar-KW')}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/orders">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4 mr-2" />
              طلباتي
            </Button>
          </Link>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">قطعي</h2>
            <Link href="/listings/new" className="text-sm text-primary hover:underline">
              إضافة قطعة
            </Link>
          </div>
          {listings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              لم تضيفي أي قطعة بعد
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {listings.slice(0, 8).map((l) => {
                const img = l.images[0] ? listingPublicUrl(l.images[0]) : '/images/listing-1.jpg'
                return (
                  <Card key={l.id} className="overflow-hidden">
                    <Link href={`/listings/${l.id}`}>
                      <div className="relative aspect-[3/4] bg-muted">
                        <Image src={img} alt={l.title} fill className="object-cover" />
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          {l.status}
                        </Badge>
                      </div>
                    </Link>
                    <CardContent className="p-3 space-y-1">
                      <p className="font-medium text-sm truncate">{l.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {Number(l.price_buy ?? 0).toLocaleString('ar-KW')} د.ك
                      </p>
                      <Link href={`/listings/${l.id}/edit`}>
                        <Button size="sm" variant="outline" className="w-full mt-2 h-8">
                          <Pencil className="h-3 w-3 mr-1" />
                          تعديل
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">آخر الرسائل</h2>
            <Link href="/messages" className="text-sm text-primary hover:underline">
              كل الرسائل
            </Link>
          </div>
          {conversations.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              لا توجد رسائل
            </div>
          ) : (
            <div className="space-y-2 max-w-3xl">
              {conversations.slice(0, 5).map((c) => (
                <Link key={c.partner_id} href={`/messages/${c.partner_id}`}>
                  <Card className="hover:bg-muted/40 transition">
                    <CardContent className="py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden relative">
                        {c.partner?.avatar_url && (
                          <Image src={c.partner.avatar_url} alt="" fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {c.partner?.full_name ?? c.partner?.username ?? 'مستخدمة'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
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
        </section>
      </main>
      <Footer />
    </div>
  )
}
