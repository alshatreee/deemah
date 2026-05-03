"use client"

import { useEffect, useState } from "react"
import { Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Hardcoded targetDate: 7 days from build time would be dynamic; use stable future date.
const TARGET = new Date("2026-12-31T23:59:59+03:00").getTime()

interface TimeLeft {
  d: number
  h: number
  m: number
  s: number
  done: boolean
}

function calc(): TimeLeft {
  const diff = TARGET - Date.now()
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true }
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s, done: false }
}

function Block({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <div className="bg-foreground text-background rounded-lg px-3 py-2 md:px-4 md:py-3 text-2xl md:text-3xl font-bold tabular-nums shadow-md">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-xs text-muted-foreground mt-1.5">{label}</span>
    </div>
  )
}

export function OfferCountdown() {
  const [t, setT] = useState<TimeLeft>(calc)

  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  if (t.done) return null

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-primary/15 via-accent/30 to-secondary border shadow-sm">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-accent/30 blur-3xl pointer-events-none" />

          <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-1 text-center md:text-right">
              <div className="inline-flex items-center gap-2 bg-primary/15 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                <Tag className="h-3.5 w-3.5" />
                <span>عرض محدود</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                خصم يصل إلى 30% على الإيجار
              </h2>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">
                احجزي إطلالة المناسبة قبل انتهاء العرض
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Clock className="h-4 w-4" />
                <span>ينتهي خلال</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3" dir="ltr">
                <Block value={t.d} label="يوم" />
                <span className="text-2xl font-bold text-muted-foreground">:</span>
                <Block value={t.h} label="ساعة" />
                <span className="text-2xl font-bold text-muted-foreground">:</span>
                <Block value={t.m} label="دقيقة" />
                <span className="text-2xl font-bold text-muted-foreground">:</span>
                <Block value={t.s} label="ثانية" />
              </div>
              <Button asChild size="lg" className="mt-2">
                <Link href="/listings">تسوّقي الآن</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
