import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Wallet } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Transaction } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    console.error('[earnings] error:', error.message)
    return []
  }
  return (data ?? []) as Transaction[]
}

function statusLabel(status: Transaction['status']): string {
  return status === 'completed' ? 'مكتمل' : status === 'pending' ? 'قيد الانتظار' : 'فشل'
}

function typeLabel(type: Transaction['type']): string {
  return type === 'earning'
    ? 'إيراد'
    : type === 'payout'
      ? 'سحب'
      : type === 'refund'
        ? 'استرداد'
        : 'رسوم'
}

export default async function EarningsPage() {
  const user = await requireUser()
  const txs = await fetchTransactions(user.id)

  const earned = txs
    .filter((t) => t.type === 'earning' && t.status === 'completed')
    .reduce((s, t) => s + Number(t.amount), 0)
  const pending = txs
    .filter((t) => t.status === 'pending')
    .reduce((s, t) => s + Number(t.amount), 0)
  const paidOut = txs
    .filter((t) => t.type === 'payout' && t.status === 'completed')
    .reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            لوحتي
          </Link>
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span>الأرباح</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Wallet className="h-7 w-7" />
          الأرباح
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">إجمالي الأرباح</p>
              <p className="text-2xl font-bold mt-1">{earned.toLocaleString('ar-KW')} د.ك</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">قيد الانتظار</p>
              <p className="text-2xl font-bold mt-1">{pending.toLocaleString('ar-KW')} د.ك</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">مسحوب</p>
              <p className="text-2xl font-bold mt-1">{paidOut.toLocaleString('ar-KW')} د.ك</p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold mb-3">آخر العمليات</h2>
          {txs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              لا توجد عمليات بعد
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {txs.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm">{typeLabel(t.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString('ar-KW')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{Number(t.amount).toLocaleString('ar-KW')} د.ك</p>
                    <Badge variant={t.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                      {statusLabel(t.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div>
          <Button disabled>
            طلب سحب (قريباً مع Tap Payments)
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
