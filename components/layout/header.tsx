"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Menu, MessageCircle, LayoutDashboard, Heart, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserNav } from "@/components/layout/user-nav"
import { NotificationBell } from "@/components/layout/notification-bell"
import { createClient } from "@/lib/supabase/client"

interface NavLink {
  href: string
  label: string
  icon?: LucideIcon
}

const publicLinks: NavLink[] = [
  { href: "/listings", label: "تصفحي" },
  { href: "/listings/new", label: "أضيفي قطعة" },
]

const authLinks: NavLink[] = [
  { href: "/messages", label: "الرسائل", icon: MessageCircle },
  { href: "/wishlist", label: "المفضلة", icon: Heart },
  { href: "/dashboard", label: "لوحتي", icon: LayoutDashboard },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const navLinks: NavLink[] = user ? [...publicLinks, ...authLinks] : publicLinks

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">ديمة</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side: Bell + Auth */}
        <div className="hidden md:flex items-center gap-2">
          <NotificationBell />
          <UserNav variant="desktop" />
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-1 md:hidden">
          <NotificationBell />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-6 pt-6">
                <Link href="/" className="text-2xl font-bold text-primary" onClick={() => setIsOpen(false)}>
                  ديمة
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 text-lg font-medium text-foreground transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>
                <UserNav variant="mobile" onNavigate={() => setIsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
