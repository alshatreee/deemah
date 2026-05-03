import { Camera, MessageSquare, Wallet } from "lucide-react"

const steps = [
  {
    icon: Camera,
    title: "أضيفي قطعتك",
    description: "صوّري ملابسك الفاخرة واكتبي وصفاً جذاباً مع تحديد السعر",
    step: "١",
  },
  {
    icon: MessageSquare,
    title: "اتفقي مع المشترية",
    description: "تواصلي مع المشتريات المهتمات وحددي تفاصيل الصفقة",
    step: "٢",
  },
  {
    icon: Wallet,
    title: "استلمي أموالك",
    description: "بعد إتمام الصفقة، استلمي أموالك بأمان وبكل سهولة",
    step: "٣",
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            كيف تعمل المنصة؟
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            ثلاث خطوات بسيطة لبدء بيع أو تأجير أزيائك الفاخرة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative text-center group"
            >
              {/* Connector Line - Hidden on mobile */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-border -translate-x-1/2" />
              )}
              
              {/* Step Circle */}
              <div className="relative inline-flex">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {step.step}
                </div>
              </div>
              
              {/* Content */}
              <h3 className="mt-6 text-xl font-bold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
