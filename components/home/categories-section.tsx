"use client"

import Link from "next/link"
import { useState } from "react"

const WOMEN_CATEGORIES = [
  { key: "suits_blazers", label: "بدلات وبليزر", icon: "👔" },
  { key: "evening_dresses", label: "فساتين سهرة", icon: "✨" },
  { key: "wedding_dresses", label: "فساتين زفاف", icon: "💍" },
  { key: "graduation", label: "تخرج", icon: "🎓" },
  { key: "abayas", label: "عبايات", icon: "🕌" },
  { key: "shoes", label: "أحذية", icon: "👠" },
  { key: "bags", label: "حقائب", icon: "👜" },
  { key: "accessories", label: "إكسسوارات", icon: "💎" },
]

const KIDS_CATEGORIES = [
  { key: "kids_girls", label: "بنات", icon: "👗" },
  { key: "kids_boys", label: "أولاد", icon: "👕" },
  { key: "kids_babies", label: "رضّع", icon: "🍼" },
  { key: "kids_shoes", label: "أحذية", icon: "👟" },
  { key: "kids_accessories", label: "إكسسوارات", icon: "🎀" },
  { key: "kids_abayas", label: "عبايات", icon: "🕌" },
]

export function CategoriesSection() {
  const [section, setSection] = useState<"women" | "kids">("women")

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-primary mb-3 uppercase">
            ◆ COLLECTIONS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            تصفحي حسب الفئة
          </h2>
          <p className="text-muted-foreground">
            اكتشفي مجموعتنا المتنوعة من الأزياء الفاخرة
          </p>

          {/* Section Tabs */}
          <div className="inline-flex bg-card border border-border rounded-full p-1 gap-1 mt-8">
            {[
              { key: "women", label: "👗 أزياء نسائية" },
              { key: "kids", label: "👧 ملابس أطفال" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key as "women" | "kids")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  section === s.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Women: 4-col grid */}
        {section === "women" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {WOMEN_CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={`/listings?section=women&category=${cat.key}`}
                className="group bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/40 hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-3 transition-transform group-hover:scale-110">
                  {cat.icon}
                </div>
                <div className="text-sm font-bold text-foreground">
                  {cat.label}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Kids: 3-col grid with "للبيع فقط" badge */}
        {section === "kids" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {KIDS_CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={`/listings?section=kids&category=${cat.key}`}
                className="group bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/40 hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-3 transition-transform group-hover:scale-110">
                  {cat.icon}
                </div>
                <div className="text-sm font-bold text-foreground mb-1">
                  {cat.label}
                </div>
                <div className="text-xs text-olive font-semibold">
                  للبيع فقط
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
