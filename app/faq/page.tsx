import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "كيف أبدأ البيع على ديمة؟",
    a: "اضغطي على زر 'أضيفي قطعة' وأضيفي صور قطعتك ووصفاً وسعراً. ستظهر للمتسوقات فور المراجعة.",
  },
  {
    q: "كيف يتم الدفع؟",
    a: "نوفّر طرق دفع آمنة. تفاصيل المدفوعات قيد التطوير وستُعلَن قريباً.",
  },
  {
    q: "ما هي رسوم المنصة؟",
    a: "الرسوم متغيرة حسب نوع المعاملة وقد تتغير. ستظهر بوضوح قبل إتمام أي عملية.",
  },
  {
    q: "هل بياناتي آمنة؟",
    a: "نحرص على حماية بياناتك. سياسة الخصوصية الكاملة قيد الإعداد.",
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">الأسئلة الشائعة</h1>
            <p className="text-muted-foreground text-lg">
              إجابات للأسئلة المتكررة عن ديمة
            </p>
          </div>

          <Accordion type="single" collapsible className="mb-12">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-right">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">لم تجدي إجابتك؟</p>
            <Button asChild>
              <Link href="/contact">تواصلي معنا</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
