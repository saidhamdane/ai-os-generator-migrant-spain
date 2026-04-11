import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IntakeForm } from '@/components/onboarding/IntakeForm'
import type { Locale } from '@/lib/types'
import { t } from '@/lib/i18n'

export default async function OnboardingPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) redirect(`/${locale}/login`)

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  })

  // Already completed intake — go to dashboard
  if (profile?.intakeCompleted) {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">م</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t(locale, 'onboarding.title')}</h1>
          <p className="text-slate-500 mt-2">{t(locale, 'onboarding.subtitle')}</p>
        </div>

        <IntakeForm locale={locale} currentStep={profile?.intakeStep || 0} />
      </div>
    </div>
  )
}
