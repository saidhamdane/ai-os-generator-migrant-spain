'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import type { ProcedureGuide } from '@prisma/client'

export default function ProcedurePage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const locale = params.locale as Locale
  const [guide, setGuide] = useState<ProcedureGuide | null>(null)
  const [contentLang, setContentLang] = useState<Locale>(locale)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/procedures/${params.slug}`)
      .then((r) => r.json())
      .then((d) => {
        setGuide(d.guide)
        setLoading(false)
      })
  }, [params.slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400 text-center">
          <span className="text-4xl">⏳</span>
          <p className="mt-3">{t(locale, 'common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>{locale === 'ar' ? 'لم يتم العثور على الدليل' : 'Guía no encontrada'}</p>
        <Link href={`/${locale}/procedures`} className="mt-4 inline-block text-indigo-600 hover:underline">
          ← {t(locale, 'procedures.back')}
        </Link>
      </div>
    )
  }

  const title = contentLang === 'ar' ? guide.titleAr : guide.titleEs
  const short = contentLang === 'ar' ? guide.shortExplanationAr : guide.shortExplanationEs
  const detailed = contentLang === 'ar' ? guide.detailedAr : guide.detailedEs
  const notes = contentLang === 'ar' ? guide.importantNotesAr : guide.importantNotesEs

  return (
    <div className="space-y-6">
      {/* Back + language toggle */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${locale}/procedures`}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <span className={locale === 'ar' ? '' : 'rotate-180'}>←</span>
          {t(locale, 'procedures.back')}
        </Link>

        {/* Content language toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setContentLang('ar')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              contentLang === 'ar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => setContentLang('es')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              contentLang === 'es' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Español
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="bg-indigo-600 text-white rounded-2xl p-7">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      {/* What is it */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t(locale, 'procedures.what_is_it')}
        </h2>
        <div dir={contentLang === 'ar' ? 'rtl' : 'ltr'} lang={contentLang}>
          <p className="text-slate-700 leading-relaxed">{short}</p>
        </div>
      </div>

      {/* Full guide */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t(locale, 'procedures.full_guide')}
        </h2>
        <div
          dir={contentLang === 'ar' ? 'rtl' : 'ltr'}
          lang={contentLang}
          className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line"
        >
          {detailed}
        </div>
      </div>

      {/* Important notes */}
      {notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-3">
            ⚠️ {t(locale, 'procedures.important_notes')}
          </h2>
          <div
            dir={contentLang === 'ar' ? 'rtl' : 'ltr'}
            lang={contentLang}
            className="text-amber-900 text-sm leading-relaxed whitespace-pre-line"
          >
            {notes}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="border border-slate-100 rounded-2xl p-4">
        <p className="text-xs text-slate-400 leading-relaxed text-center">
          {t(locale, 'landing.disclaimer')}
        </p>
      </div>
    </div>
  )
}
