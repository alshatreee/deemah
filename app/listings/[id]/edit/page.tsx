import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { requireUser } from '@/lib/auth'
import { fetchListingById } from '@/lib/listings'
import { ListingForm } from '@/app/listings/new/listing-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params
  const user = await requireUser()
  const listing = await fetchListingById(id)
  if (!listing) notFound()
  if (listing.owner_id !== user.id) {
    redirect(`/listings/${id}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">تعديل القطعة</h1>
        </div>
        <ListingForm ownerId={user.id} mode="edit" initial={listing} />
      </main>
      <Footer />
    </div>
  )
}
