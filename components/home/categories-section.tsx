import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

const categories = [
  {
    id: "women",
    title: "أزياء نسائية",
    description: "فساتين، عبايات، حقائب وأكثر",
    image: "/images/category-women.jpg",
    href: "/listings?category=women",
    count: 1200,
  },
  {
    id: "kids",
    title: "ملابس أطفال",
    description: "ملابس راقية للصغار",
    image: "/images/category-kids.jpg",
    href: "/listings?category=kids",
    count: 350,
  },
]

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            تصفحي حسب الفئة
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            اكتشفي مجموعتنا المتنوعة من الأزياء الفاخرة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden rounded-3xl aspect-[4/3] bg-muted"
            >
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      {category.title}
                    </h3>
                    <p className="mt-2 text-white/80">
                      {category.description}
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      {category.count}+ قطعة
                    </p>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all group-hover:bg-primary group-hover:scale-110">
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
