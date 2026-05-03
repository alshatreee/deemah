import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const liftaswash = localFont({
  src: '../public/fonts/Liftaswashfixed-Regular.otf',
  variable: '--font-liftaswash',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ديمة | منصة الأزياء الفاخرة في الكويت',
  description: 'منصة الأزياء الفاخرة في الكويت - بيع وتأجير الملابس الراقية بأسلوب سهل وموثوق',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#c4956a',
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
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
