import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Star, MessageSquare, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { fetchUserListings } from '@/lib/listings'
import { listingPublicUrl } from '@/lib/storage'
import { getUser } from '@/lib/auth'
import type { UserProfile } from '@/lib/types'
import { ReviewList } from '@/components/reviews/review-list'

interface PageProps {
  params: Promise<{ username: string }>
}

export const dynamic = 'force-dynamic'

async function fetchProfileByUsernameOrId(key: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  const isUuid = /^[0-9a-f-]{36}$/i.test(key)
  const { data } = isUuid
    ? await supabase.from('users').select('*').eq('id', key).maybeSingle()
    : await supabase.from('users').select('*').eq('username', key).maybeSingle()
  return (data as UserProfile) ?? null
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params
  const profile = await fetchProfileByUsernameOrId(username)
  if (!profile) notFound()

  const listings = await fetchUserListings(profile.id)
  const me = await getUser()
  const isMe = !!me && me.id === profile.id

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardContent className="pt-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted shrink-0">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-muted-foreground">
                  {(profile.full_name ?? 'م').charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">
                  {profile.full_name ?? profile.username ?? 'بائعة'}
                </h1>
                {profile.is_verified && (
                  <Badge className="bg-primary text-primary-foreground">موثّقة</Badge>
                )}
              </div>
              {profile.username && (
                <p className="text-sm text-muted-foreground" dir="ltr">
                  @{profile.username}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-amber-500" />
                  {Number(profile.rating ?? 0).toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.city ?? 'الكويت'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  منذ {new Date(profile.created_at).toLocaleDateString('ar-KW', { year: 'numeric', month: 'short' })}
                </span>
              </div>
              {profile.bio && (
                <p className="text-sm leading-7 mt-2 whitespace-pre-wrap">{profile.bio}</p>
              )}
              <div className="flex gap-2 pt-2">
                {isMe ? (
                  <Link href="/profile">
                    <Button variant="outline" size="sm">
                      تعديل ملفي
                    </Button>
                  </Link>
                ) : me ? (
                  <Link href={`/messages/${profile.id}`}>
                    <Button size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      راسلي
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/login?redirectTo=/profile/${username}`}>
                    <Button size="sm">سجّلي للتواصل</Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <section>
          <h2 className="text-xl font-semibold mb-3">قطع البائعة ({listings.length})</h2>
          {listings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              لا قطع منشورة
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {listings
                .filter((l) => l.status === 'active')
                .map((l) => {
                  const img = l.images[0] ? listingPublicUrl(l.images[0]) : '/images/listing-1.jpg'
                  return (
                    <Link key={l.id} href={`/listings/${l.id}`}>
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative aspect-[3/4] bg-muted">
                          <Image src={img} alt={l.title} fill className="object-cover" />
                        </div>
                        <CardContent className="p-3">
                          <p className="font-medium text-sm truncate">{l.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Number(l.price_buy ?? 0).toLocaleString('ar-KW')} د.ك
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">التقييمات</h2>
          <ReviewList sellerId={profile.id} />
        </section>
      </main>
      <Footer />
    </div>
  )
}
