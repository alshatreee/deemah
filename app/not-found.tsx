import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
      <div className="max-w-md text-center px-4">
        <h2 className="text-6xl font-bold text-primary">404</h2>
        <p className="mt-4 text-xl font-bold text-foreground">الصفحة غير موجودة</p>
        <p className="mt-2 text-muted-foreground">الصفحة التي تبحثين عنها غير متاحة أو تم حذفها.</p>
        <Button asChild className="mt-6">
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  )
}
