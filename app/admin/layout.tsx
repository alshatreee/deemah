import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { requireAdmin } from '@/lib/admin/guard'

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/admin', label: 'الرئيسية' },
  { href: '/admin/users', label: 'المستخدمات' },
  { href: '/admin/listings', label: 'المنتجات' },
  { href: '/admin/disputes', label: 'النزاعات' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />
      <div className="container mx-auto px-4 py-6 flex flex-1 gap-6">
        <aside className="w-56 shrink-0 border-l pl-4">
          <h2 className="text-lg font-bold mb-4">لوحة الإدارة</h2>
          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
