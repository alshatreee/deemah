import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MessageCircle, Instagram } from "lucide-react"

const channels = [
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    value: "info@dima.example",
    href: "mailto:info@dima.example",
  },
  {
    icon: MessageCircle,
    title: "رسائل المنصة",
    value: "افتحي صندوق الرسائل",
    href: "/messages",
  },
  {
    icon: Instagram,
    title: "إنستغرام",
    value: "@dima",
    href: "#",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">تواصلي معنا</h1>
            <p className="text-muted-foreground text-lg">
              نحن هنا لمساعدتك في أي وقت
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {channels.map((c) => (
              <Card key={c.title}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <c.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{c.title}</h3>
                  <Link
                    href={c.href}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {c.value}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              نموذج الاتصال الكامل قيد التطوير
            </p>
            <Button variant="outline" asChild>
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
