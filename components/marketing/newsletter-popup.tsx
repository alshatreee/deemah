"use client"

import { useEffect, useState } from "react"
import { X, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const STORAGE_KEY = "deemah_newsletter_dismissed"
const SHOW_DELAY_MS = 6000

export function NewsletterPopup() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return
    } catch {}
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const close = () => {
    setOpen(false)
    try {
      sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {}
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // Mock signup — no backend yet
    console.log("[deemah] newsletter signup:", email)
    setSubmitted(true)
    setTimeout(close, 2200)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={close}
    >
      <div
        className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Hero strip */}
        <div className="bg-gradient-to-bl from-primary/20 via-accent/40 to-secondary p-8 text-center border-b">
          <div className="inline-flex w-14 h-14 rounded-full bg-primary text-primary-foreground items-center justify-center mb-3 shadow-md">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            مرحباً بكِ في ديمة
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            اشتركي بالنشرة واحصلي على{" "}
            <span className="font-bold text-primary">خصم 10%</span> على أول طلب
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">✨</div>
              <p className="font-semibold text-foreground">شكراً لاشتراكك!</p>
              <p className="text-sm text-muted-foreground mt-1">
                ستصلك أحدث العروض قريباً
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 text-right"
                  dir="rtl"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                اشتركي الآن
              </Button>
              <button
                type="button"
                onClick={close}
                className="block w-full text-xs text-muted-foreground hover:text-foreground transition"
              >
                لا، شكراً
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
