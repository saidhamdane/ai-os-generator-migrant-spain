import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'

export const metadata: Metadata = {
  title: 'MigrantCopilot — مساعد المهاجر في إسبانيا',
  description:
    'AI assistant for immigrants in Spain. Step-by-step guidance in Arabic and Spanish. / مساعد ذكي للمهاجرين في إسبانيا.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const locale = headersList.get('x-locale') || 'ar'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir} className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  )
}
