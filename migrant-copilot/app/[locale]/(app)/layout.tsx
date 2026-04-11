import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AppSidebar } from '@/components/shared/AppSidebar'
import { MobileNav } from '@/components/shared/MobileNav'
import type { Locale } from '@/lib/types'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const locale = params.locale as Locale
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <AppSidebar locale={locale} userName={session.user?.name || ''} />

      {/* Main content */}
      <main className="flex-1 ltr:ml-64 rtl:mr-64 pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav locale={locale} />
    </div>
  )
}
