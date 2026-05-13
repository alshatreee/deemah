import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { CookieBanner } from '@/components/layout/cookie-banner'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import { MicrosoftClarity } from '@/components/analytics/clarity'
import './globals.css'

const liftaswash = localFont({
  src: '../public/fonts/Liftaswashfixed-Regular.otf',
  variable: '--font-liftaswash',
  display: 'swap',
  preload: true,
})

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deemah.com' // TODO: confirm production domain
const SITE_NAME = 'ديمة'
const SITE_DESCRIPTION =
  'منصة الأزياء الفاخرة في الكويت — اكتشفي وبيعي أرقى قطع الملابس بأسلوب سهل وموثوق'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ديمة | منصة الأزياء الفاخرة في الكويت',
    template: '%s | ديمة',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ديمة',
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_KW',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'ديمة | منصة الأزياء الفاخرة في الكويت',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ديمة - منصة الأزياء الفاخرة في الكويت',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ديمة | منصة الأزياء الفاخرة في الكويت',
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#b8860b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className="bg-background">
      <body className={`${liftaswash.variable} font-sans antialiased`}>
        {children}
        <CookieBanner />
        <GoogleAnalytics />
        <MicrosoftClarity />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
