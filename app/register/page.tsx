'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserPlus } from 'lucide-react'
import { registerAction } from './actions'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await registerAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
              <CardDescription>
                انضمي إلى مجتمع ديمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="full_name">الاسم الكامل</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    placeholder="ديمة محمد"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    dir="ltr"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <Button type="submit" disabled={isPending}>
                  {isPending ? 'جارٍ الإنشاء…' : 'إنشاء حساب'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  بإنشاء حساب فأنتِ توافقين على{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    الشروط والأحكام
                  </Link>
                </p>

                <p className="text-sm text-center text-muted-foreground mt-2">
                  لديكِ حساب؟{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    سجّلي دخولاً
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
