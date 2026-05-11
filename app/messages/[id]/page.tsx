import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ChevronRight } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { fetchThread } from '@/lib/messages'
import { ThreadClient } from './thread-client'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ listing?: string }>
}

export const dynamic = 'force-dynamic'

export default async function MessageThreadPage({ params, searchParams }: PageProps) {
  const me = await requireUser()
  const { id: partnerId } = await params
  const { listing } = await searchParams
  const { messages, partner } = await fetchThread(me.id, partnerId)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-3 max-w-3xl mx-auto">
          <Link href="/messages" className="text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden relative shrink-0">
            {partner?.avatar_url && (
              <Image src={partner.avatar_url} alt="" fill className="object-cover" />
            )}
          </div>
          <div>
            <p className="font-semibold">
              {partner?.full_name ?? partner?.username ?? 'مستخدمة'}
            </p>
          </div>
        </div>

        <ThreadClient
          meId={me.id}
          partnerId={partnerId}
          initialMessages={messages}
          listingId={listing}
        />
      </main>
      <Footer />
    </div>
  )
}
