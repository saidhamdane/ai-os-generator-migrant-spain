'use client'

import { useState } from 'react'
import Link from 'next/link'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import type { ChecklistItem } from '@prisma/client'

type Tab = 'all' | 'missing' | 'ready'
type DocStatus = 'missing' | 'ready' | 'needs_translation' | 'not_applicable'

interface Props {
  items: ChecklistItem[]
  locale: Locale
  isPaid: boolean
  freeLimit: number
  checklistId: string
}

const STATUS_CONFIG: Record<DocStatus, { label_key: string; color: string; icon: string }> = {
  missing: { label_key: 'documents.status_missing', color: 'bg-red-100 text-red-700', icon: '❌' },
  ready: { label_key: 'documents.status_ready', color: 'bg-emerald-100 text-emerald-700', icon: '✅' },
  needs_translation: { label_key: 'documents.status_needs_translation', color: 'bg-amber-100 text-amber-700', icon: '⚠️' },
  not_applicable: { label_key: 'documents.status_not_applicable', color: 'bg-slate-100 text-slate-500', icon: '—' },
}

const CATEGORY_LABELS: Record<string, string> = {
  registration: 'Empadronamiento / التسجيل البلدي',
  documentation: 'NIE / TIE — الوثائق الرسمية',
  health: 'Salud / الصحة',
  banking: 'Banca / البنوك',
  work: 'Trabajo / العمل',
  education: 'Educación / التعليم',
  other: 'Otros / أخرى',
}

export function ChecklistView({ items, locale, isPaid, freeLimit, checklistId }: Props) {
  const [tab, setTab] = useState<Tab>('all')
  const [localItems, setLocalItems] = useState(items)
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(itemId: string, status: DocStatus) {
    setUpdating(itemId)
    setLocalItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status } : i)))
    try {
      await fetch(`/api/checklist/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } finally {
      setUpdating(null)
    }
  }

  const filtered = localItems.filter((item) => {
    if (tab === 'missing') return item.status === 'missing' || item.status === 'needs_translation'
    if (tab === 'ready') return item.status === 'ready'
    return true
  })

  // Group by category
  const grouped: Record<string, typeof filtered> = {}
  for (const item of filtered) {
    if (!grouped[item.stepCategory]) grouped[item.stepCategory] = []
    grouped[item.stepCategory].push(item)
  }

  // Free user: only show first N items total
  let visibleCount = 0

  const missingCount = localItems.filter((i) => i.status === 'missing').length
  const readyCount = localItems.filter((i) => i.status === 'ready').length

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {(['all', 'missing', 'ready'] as Tab[]).map((tabId) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === tabId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t(locale, `documents.tab_${tabId}`)}
            {tabId === 'missing' && missingCount > 0 && (
              <span className="ms-1.5 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full ltr-nums">
                {missingCount}
              </span>
            )}
            {tabId === 'ready' && readyCount > 0 && (
              <span className="ms-1.5 bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full ltr-nums">
                {readyCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Groups */}
      {Object.entries(grouped).map(([category, catItems]) => {
        const catLabel = CATEGORY_LABELS[category] || category

        return (
          <div key={category} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">{catLabel}</h3>
            </div>

            <div className="divide-y divide-slate-50">
              {catItems.map((item) => {
                visibleCount++
                const isLocked = !isPaid && visibleCount > freeLimit

                if (isLocked) {
                  return (
                    <div key={item.id} className="px-5 py-4 relative">
                      <div className="blur-sm select-none pointer-events-none flex items-center gap-3">
                        <span className="text-lg">📄</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-400">Document name</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-end pe-4">
                        <span className="text-xs text-slate-400">🔒</span>
                      </div>
                    </div>
                  )
                }

                const statusConfig = STATUS_CONFIG[item.status as DocStatus] || STATUS_CONFIG.missing
                const name = locale === 'ar' ? item.nameAr : item.nameEs
                const description = locale === 'ar' ? item.descriptionAr : item.descriptionEs

                return (
                  <div key={item.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5 flex-shrink-0">{statusConfig.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900">{name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusConfig.color}`}>
                            {t(locale, statusConfig.label_key)}
                          </span>
                        </div>
                        {description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
                        )}
                        {item.needsTranslation && (
                          <p className="text-xs text-amber-600 mt-1 font-medium">
                            ⚠️ {t(locale, 'documents.needs_translation')}
                          </p>
                        )}

                        {/* Status selector */}
                        {isPaid && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {(['missing', 'ready', 'needs_translation'] as DocStatus[]).map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(item.id, s)}
                                disabled={updating === item.id || item.status === s}
                                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                                  item.status === s
                                    ? `${statusConfig.color} border-transparent`
                                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                              >
                                {t(locale, `documents.status_${s}`)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Upgrade prompt */}
      {!isPaid && items.length > freeLimit && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 text-center">
          <p className="font-semibold text-lg mb-1">{t(locale, 'documents.locked_title')}</p>
          <p className="text-slate-300 text-sm mb-4">{t(locale, 'documents.locked_desc')}</p>
          <Link
            href={`/${locale}/profile`}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
          >
            ⭐ {t(locale, 'upgrade.cta')}
          </Link>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <span className="text-4xl">📭</span>
          <p className="mt-3 text-sm">{locale === 'ar' ? 'لا توجد عناصر' : 'Sin elementos'}</p>
        </div>
      )}
    </div>
  )
}
