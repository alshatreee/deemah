import Link from "next/link"
import { Instagram, Twitter, Mail, Phone } from "lucide-react"

const footerLinks = {
  platform: [
    { href: "/listings", label: "تصفحي القطع" },
    { href: "/listings/new", label: "أضيفي قطعتك" },
    { href: "/how-it-works", label: "كيف تعمل المنصة" },
  ],
  support: [
    { href: "/faq", label: "الأسئلة الشائعة" },
    { href: "/contact", label: "تواصلي معنا" },
    { href: "/terms", label: "الشروط والأحكام" },
  ],
  social: [
    { href: "https://instagram.com", icon: Instagram, label: "انستغرام" },
    { href: "https://twitter.com", icon: Twitter, label: "تويتر" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-primary">
              ديمة
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              منصة الأزياء الفاخرة في الكويت. بيعي وأجّري ملابسك الراقية بكل سهولة وثقة.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">المنصة</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">الدعم</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">تواصلي معنا</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@deema.kw"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  hello@deema.kw
                </a>
              </li>
              <li>
                <a
                  href="tel:+96512345678"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +965 1234 5678
                </a>
              </li>
              <li className="flex gap-4 pt-2">
                {footerLinks.social.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ديمة. جميع الحقوق محفوظة.
            </p>
            <p className="text-sm text-muted-foreground">
              صُنع بـ ❤️ في الكويت
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
