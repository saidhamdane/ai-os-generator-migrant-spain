import Link from 'next/link'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export default function LandingPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">م</span>
            </div>
            <span className="font-semibold text-slate-800 text-lg">MigrantCopilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale === 'ar' ? 'es' : 'ar'}`}
              className="text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              {locale === 'ar' ? 'Español' : 'العربية'}
            </Link>
            <Link
              href={`/${locale}/login`}
              className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100"
            >
              {t(locale, 'auth.btn_login')}
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              {t(locale, 'landing.cta_start')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span>🇪🇸</span>
          <span>{locale === 'ar' ? 'للمهاجرين العرب في إسبانيا' : 'Para inmigrantes árabes en España'}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
          {t(locale, 'landing.hero_title')}
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t(locale, 'landing.hero_subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            {t(locale, 'landing.cta_start')}
            <span className={locale === 'ar' ? 'rotate-180' : ''}>→</span>
          </Link>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-50 border border-slate-200"
          >
            {t(locale, 'auth.btn_login')}
          </Link>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          {locale === 'ar' ? 'مجاني للبدء · لا يلزم بطاقة ائتمان' : 'Gratis para empezar · Sin tarjeta de crédito'}
        </p>
      </section>

      {/* Pain points */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: t(locale, 'landing.pain_1'), icon: '😰' },
              { text: t(locale, 'landing.pain_2'), icon: '🤔' },
              { text: t(locale, 'landing.pain_3'), icon: '📅' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="text-3xl mb-4">{item.icon}</div>
                <p className="text-slate-700 font-medium leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-14">
          {t(locale, 'landing.how_title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              step: '01',
              title: t(locale, 'landing.how_1_title'),
              desc: t(locale, 'landing.how_1_desc'),
              icon: '📝',
            },
            {
              step: '02',
              title: t(locale, 'landing.how_2_title'),
              desc: t(locale, 'landing.how_2_desc'),
              icon: '🗺️',
            },
            {
              step: '03',
              title: t(locale, 'landing.how_3_title'),
              desc: t(locale, 'landing.how_3_desc'),
              icon: '✅',
            },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-2 ltr-nums">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {locale === 'ar' ? 'ابدأ الآن مجاناً' : 'Empieza ahora gratis'}
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            {locale === 'ar'
              ? 'احصل على خطتك الشخصية في 5 دقائق'
              : 'Obtén tu plan personal en 5 minutos'}
          </p>
          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50"
          >
            {t(locale, 'landing.cta_start')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            {t(locale, 'landing.disclaimer')}
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            <span className="text-sm text-slate-500">© 2026 MigrantCopilot</span>
            <Link href={`/${locale === 'ar' ? 'es' : 'ar'}`} className="text-sm text-slate-500 hover:text-slate-700">
              {locale === 'ar' ? 'Español' : 'العربية'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
