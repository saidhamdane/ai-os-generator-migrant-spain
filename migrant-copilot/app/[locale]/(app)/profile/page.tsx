import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSubscription } from '@/lib/subscription'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { format } from 'date-fns'

export default async function ProfilePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/login`)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true, email: true, cityInSpain: true, preferredLanguage: true },
  })

  const sub = await getSubscription(session.user.id)
  const isPaid = sub?.status === 'active' || sub?.status === 'trialing'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t(locale, 'profile.title')}</h1>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          {locale === 'ar' ? 'المعلومات الشخصية' : 'Información personal'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">{t(locale, 'profile.name')}</label>
            <p className="text-slate-900 font-medium">{user?.fullName || '—'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">{t(locale, 'profile.email')}</label>
            <p className="text-slate-900 font-medium ltr-nums" dir="ltr">{user?.email || '—'}</p>
          </div>
          {user?.cityInSpain && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t(locale, 'profile.city')}</label>
              <p className="text-slate-900 font-medium">{user.cityInSpain}</p>
            </div>
          )}
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          {t(locale, 'profile.language')}
        </h2>
        <div className="flex gap-3">
          <Link
            href="/ar/dashboard"
            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
              locale === 'ar'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>🇸🇦</span> {t(locale, 'profile.lang_ar')}
          </Link>
          <Link
            href="/es/dashboard"
            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
              locale === 'es'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>🇪🇸</span> {t(locale, 'profile.lang_es')}
          </Link>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          {t(locale, 'profile.subscription')}
        </h2>

        {isPaid ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full">
                ⭐ {t(locale, 'profile.plan_pro')}
              </span>
            </div>
            {sub?.currentPeriodEnd && (
              <p className="text-sm text-slate-500">
                {t(locale, 'profile.active_until', {
                  date: format(sub.currentPeriodEnd, 'dd/MM/yyyy'),
                })}
              </p>
            )}
            <form action="/api/stripe/portal" method="POST" className="mt-4">
              <button
                type="submit"
                className="text-sm border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 font-medium"
              >
                {t(locale, 'profile.manage_billing')}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-slate-100 text-slate-600 text-sm font-medium px-3 py-1 rounded-full">
                {t(locale, 'profile.plan_free')}
              </span>
            </div>

            {/* Feature comparison */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-xl p-5 mb-4">
              <p className="font-bold text-slate-900 mb-3">{t(locale, 'upgrade.title')}</p>
              <p className="text-lg font-bold text-indigo-600 mb-4">{t(locale, 'upgrade.price')}</p>
              <ul className="space-y-2">
                {(['feature_1', 'feature_2', 'feature_3', 'feature_4'] as const).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                    {t(locale, `upgrade.${f}`)}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-3">{t(locale, 'upgrade.cancel')}</p>
            </div>

            <form action="/api/stripe/checkout" method="POST">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
              >
                ⭐ {t(locale, 'upgrade.cta')}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-4">
          {t(locale, 'profile.danger_zone')}
        </h2>
        <button className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 font-medium">
          {t(locale, 'profile.delete_account')}
        </button>
      </div>
    </div>
  )
}
