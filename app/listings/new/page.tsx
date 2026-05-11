import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { requireUser } from '@/lib/auth'
import { ListingForm } from './listing-form'

export const dynamic = 'force-dynamic'

export default async function NewListingPage() {
  const user = await requireUser()
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">أضيفي قطعة جديدة</h1>
          <p className="text-muted-foreground mt-1">شاركي قطعتك مع مجتمع ديمة</p>
        </div>
        <ListingForm ownerId={user.id} mode="create" />
      </main>
      <Footer />
    </div>
  )
}
