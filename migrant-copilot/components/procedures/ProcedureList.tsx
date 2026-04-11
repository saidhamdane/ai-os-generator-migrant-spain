'use client'

import { useState } from 'react'
import Link from 'next/link'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import type { ProcedureGuide } from '@prisma/client'

const CATEGORY_ICONS: Record<string, string> = {
  registration: '🏛️',
  documentation: '📋',
  health: '🏥',
  work: '💼',
  banking: '🏦',
  education: '🎓',
  other: '📌',
}

interface Props {
  guides: ProcedureGuide[]
  locale: Locale
}

export function ProcedureList({ guides, locale }: Props) {
  const [search, setSearch] = useState('')

  const filtered = guides.filter((g) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      g.titleAr.toLowerCase().includes(q) ||
      g.titleEs.toLowerCase().includes(q) ||
      g.shortExplanationAr.toLowerCase().includes(q) ||
      g.shortExplanationEs.toLowerCase().includes(q)
    )
  })

  // Group by category
  const grouped: Record<string, ProcedureGuide[]> = {}
  for (const guide of filtered) {
    if (!grouped[guide.category]) grouped[guide.category] = []
    grouped[guide.category].push(guide)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(locale, 'procedures.search')}
          className="w-full px-4 py-3 ps-11 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
      </div>

      {/* Groups */}
      {Object.entries(grouped).map(([category, catGuides]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{CATEGORY_ICONS[category] || '📌'}</span>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {t(locale, `procedures.category_${category}`)}
            </h2>
          </div>

          <div className="space-y-3">
            {catGuides.map((guide) => {
              const title = locale === 'ar' ? guide.titleAr : guide.titleEs
              const short = locale === 'ar' ? guide.shortExplanationAr : guide.shortExplanationEs

              return (
                <Link
                  key={guide.id}
                  href={`/${locale}/procedures/${guide.slug}`}
                  className="block bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed line-clamp-2">{short}</p>
                    </div>
                    <span className="text-slate-300 group-hover:text-indigo-400 transition-colors text-xl flex-shrink-0 mt-0.5">
                      {locale === 'ar' ? '←' : '→'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-xs text-indigo-600 font-medium">
                      {t(locale, 'procedures.read_guide')} →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <span className="text-4xl">🔍</span>
          <p className="mt-3 text-sm">
            {locale === 'ar' ? 'لا توجد نتائج' : 'Sin resultados'}
          </p>
        </div>
      )}
    </div>
  )
}
