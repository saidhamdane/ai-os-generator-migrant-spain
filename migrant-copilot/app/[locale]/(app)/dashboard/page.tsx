import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPaidUser } from '@/lib/subscription'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) redirect(`/${locale}/login`)
  const userId = session.user.id

  const profile = await prisma.userProfile.findUnique({ where: { userId } })
  if (!profile?.intakeCompleted) redirect(`/${locale}/onboarding`)

  const roadmap = await prisma.roadmap.findFirst({
    where: { userId, status: 'active' },
    include: {
      steps: { orderBy: { stepOrder: 'asc' } },
      checklist: { include: { items: true } },
    },
  })

  const paid = await isPaidUser(userId)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } })

  const steps = roadmap?.steps || []
  const doneSteps = steps.filter((s) => s.status === 'done').length
  const totalSteps = steps.length
  const nextStep = steps.find((s) => s.status !== 'done' && s.status !== 'skipped')

  const allItems = roadmap?.checklist?.items || []
  const missingCount = allItems.filter((i) => i.status === 'missing').length

  const firstName = (user?.fullName || session.user?.name || '').split(' ')[0]
  const progressPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t(locale, 'dashboard.welcome', { name: firstName })}
        </h1>
        <p className="text-slate-500 mt-1">{t(locale, 'dashboard.welcome_subtitle')}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">
            {t(locale, 'dashboard.progress', {
              done: String(doneSteps),
              total: String(totalSteps),
            })}
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

      {/* Next step card */}
      {nextStep && (
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
          <p className="text-indigo-200 text-sm font-medium mb-2">{t(locale, 'dashboard.next_step_label')}</p>
          <h2 className="text-xl font-bold mb-4">
            {locale === 'ar' ? nextStep.titleAr : nextStep.titleEs}
          </h2>
          <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
            {locale === 'ar' ? nextStep.descriptionAr : nextStep.descriptionEs}
          </p>
          <Link
            href={`/${locale}/roadmap`}
            className="inline-flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-50"
          >
            {t(locale, 'dashboard.start_step')}
            <span className={locale === 'ar' ? 'rotate-180' : ''}>→</span>
          </Link>
        </div>
      )}

      {/* Missing documents alert */}
      {missingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-2xl">📄</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">
              {t(locale, 'dashboard.docs_alert', { count: String(missingCount) })}
            </p>
            <Link
              href={`/${locale}/documents`}
              className="text-sm text-amber-700 font-medium hover:underline mt-1 inline-block"
            >
              {t(locale, 'dashboard.view_checklist')} →
            </Link>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-emerald-600 ltr-nums">{doneSteps}</div>
          <div className="text-xs text-slate-500 mt-1">
            {locale === 'ar' ? 'خطوة مكتملة' : 'Completados'}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-indigo-600 ltr-nums">{totalSteps - doneSteps}</div>
          <div className="text-xs text-slate-500 mt-1">
            {locale === 'ar' ? 'متبقية' : 'Pendientes'}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-amber-600 ltr-nums">{missingCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {locale === 'ar' ? 'وثيقة مطلوبة' : 'Docs pendientes'}
          </div>
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      {!paid && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">{t(locale, 'dashboard.upgrade_title')}</h3>
          <p className="text-slate-300 text-sm mb-5 leading-relaxed">{t(locale, 'dashboard.upgrade_desc')}</p>
          <Link
            href={`/${locale}/profile`}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            ⭐ {t(locale, 'dashboard.upgrade_cta')}
          </Link>
        </div>
      )}
    </div>
  )
}
