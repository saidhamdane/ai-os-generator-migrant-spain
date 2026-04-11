import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPaidUser } from '@/lib/subscription'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { StepList } from '@/components/roadmap/StepList'

const FREE_STEP_LIMIT = 2

export default async function RoadmapPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/login`)

  const roadmap = await prisma.roadmap.findFirst({
    where: { userId: session.user.id, status: 'active' },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
  })

  if (!roadmap) redirect(`/${locale}/onboarding`)

  const paid = await isPaidUser(session.user.id)
  const steps = roadmap.steps
  const doneCount = steps.filter((s) => s.status === 'done').length
  const progressPct = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t(locale, 'roadmap.title')}</h1>
        <p className="text-slate-500 mt-1">{t(locale, 'roadmap.subtitle')}</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">
            {t(locale, 'roadmap.progress', { done: String(doneCount), total: String(steps.length) })}
          </span>
          <span className="text-sm font-bold text-indigo-600 ltr-nums">{progressPct}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <StepList
        steps={steps}
        locale={locale}
        isPaid={paid}
        freeLimit={FREE_STEP_LIMIT}
      />
    </div>
  )
}
