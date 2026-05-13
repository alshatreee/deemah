import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { requireUser, getProfile } from '@/lib/auth'
import { ProfileForm } from './profile-form'
import { DangerZone } from './danger-zone'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  await requireUser()
  const profile = await getProfile()
  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">ملفي الشخصي</h1>
        <ProfileForm profile={profile} />
        <DangerZone />
      </main>
      <Footer />
    </div>
  )
}
