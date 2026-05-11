import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, ShoppingBag, Wallet } from "lucide-react"

const steps = [
  {
    icon: Camera,
    title: "أضيفي قطعتك",
    description: "صوّري قطعتك واكتبي وصفاً جذاباً وحدّدي السعر.",
  },
  {
    icon: ShoppingBag,
    title: "تواصلي مع المشترين",
    description: "استقبلي الطلبات والرسائل من المهتمات بقطعتك.",
  },
  {
    icon: Wallet,
    title: "اربحي بسهولة",
    description: "استلمي أرباحك بعد إتمام البيع بنجاح.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">كيف تعمل ديمة</h1>
            <p className="text-muted-foreground text-lg">
              ثلاث خطوات بسيطة لبدء البيع على ديمة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {steps.map((step, idx) => (
              <Card key={step.title}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">الخطوة {idx + 1}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/listings/new">أضيفي قطعتك الآن</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
