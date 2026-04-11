import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPaidUser } from '@/lib/subscription'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns'

export default async function RemindersPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/login`)

  const paid = await isPaidUser(session.user.id)

  if (!paid) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t(locale, 'reminders.title')}</h1>
          <p className="text-slate-500 mt-1">{t(locale, 'reminders.subtitle')}</p>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-8 text-center">
          <span className="text-5xl">🔒</span>
          <h2 className="text-xl font-bold mt-4 mb-2">{t(locale, 'reminders.locked_title')}</h2>
          <p className="text-slate-300 mb-6">{t(locale, 'reminders.locked_desc')}</p>
          <Link
            href={`/${locale}/profile`}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-xl font-semibold"
          >
            ⭐ {t(locale, 'upgrade.cta')}
          </Link>
        </div>
      </div>
    )
  }

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id },
    orderBy: { remindAt: 'asc' },
  })

  const now = new Date()
  const pending = reminders.filter((r) => r.status === 'pending' && !isPast(r.remindAt))
  const dueSoon = pending.filter((r) => differenceInDays(r.remindAt, now) <= 3)
  const upcoming = pending.filter((r) => differenceInDays(r.remindAt, now) > 3)
  const done = reminders.filter((r) => r.status === 'done' || isPast(r.remindAt))

  function formatDate(date: Date): string {
    if (isToday(date)) return locale === 'ar' ? 'اليوم' : 'Hoy'
    if (isTomorrow(date)) return locale === 'ar' ? 'غداً' : 'Mañana'
    return format(date, 'dd/MM/yyyy')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t(locale, 'reminders.title')}</h1>
        <p className="text-slate-500 mt-1">{t(locale, 'reminders.subtitle')}</p>
      </div>

      {/* Email notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        📧 {t(locale, 'reminders.email_notice')}
      </div>

      {/* Due soon */}
      {dueSoon.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            ⏰ {t(locale, 'reminders.due_soon')}
          </h2>
          <div className="space-y-3">
            {dueSoon.map((r) => (
              <div key={r.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-amber-900">
                      {locale === 'ar' ? r.titleAr : r.titleEs}
                    </p>
                    <p className="text-sm text-amber-700 mt-1 ltr-nums">{formatDate(r.remindAt)}</p>
                  </div>
                  <ReminderDoneButton id={r.id} locale={locale} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            📅 {t(locale, 'reminders.upcoming')}
          </h2>
          <div className="space-y-3">
            {upcoming.map((r) => (
              <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">{locale === 'ar' ? r.titleAr : r.titleEs}</p>
                    <p className="text-sm text-slate-500 mt-1 ltr-nums">{formatDate(r.remindAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            ✅ {t(locale, 'reminders.completed')}
          </h2>
          <div className="space-y-3">
            {done.slice(0, 5).map((r) => (
              <div key={r.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 opacity-60">
                <p className="text-sm font-medium text-slate-500 line-through">
                  {locale === 'ar' ? r.titleAr : r.titleEs}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <span className="text-5xl">🔔</span>
          <p className="mt-4">{t(locale, 'reminders.empty')}</p>
        </div>
      )}
    </div>
  )
}

function ReminderDoneButton({ id, locale }: { id: string; locale: Locale }) {
  return (
    <form
      action={async () => {
        'use server'
        await (await import('@/lib/prisma')).prisma.reminder.update({
          where: { id },
          data: { status: 'done' },
        })
      }}
    >
      <button
        type="submit"
        className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 flex-shrink-0"
      >
        ✓ {t(locale, 'reminders.mark_done')}
      </button>
    </form>
  )
}
