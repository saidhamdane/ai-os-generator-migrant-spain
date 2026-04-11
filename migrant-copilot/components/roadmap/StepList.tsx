'use client'

import { useState } from 'react'
import Link from 'next/link'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import type { RoadmapStep } from '@prisma/client'

interface Props {
  steps: RoadmapStep[]
  locale: Locale
  isPaid: boolean
  freeLimit: number
}

const STATUS_STYLES: Record<string, string> = {
  done: 'border-emerald-200 bg-emerald-50',
  in_progress: 'border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100',
  pending: 'border-slate-200 bg-white',
  skipped: 'border-slate-100 bg-slate-50 opacity-60',
}

export function StepList({ steps, locale, isPaid, freeLimit }: Props) {
  const [localSteps, setLocalSteps] = useState(steps)
  const [loading, setLoading] = useState<string | null>(null)

  async function markDone(stepId: string) {
    setLoading(stepId)
    setLocalSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status: 'done' as const } : s))
    )

    try {
      await fetch(`/api/roadmap/steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      })
    } catch {
      // revert on error
      setLocalSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, status: 'pending' as const } : s))
      )
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {localSteps.map((step, idx) => {
        const isLocked = !isPaid && idx >= freeLimit
        const title = locale === 'ar' ? step.titleAr : step.titleEs
        const description = locale === 'ar' ? step.descriptionAr : step.descriptionEs

        if (isLocked) {
          return (
            <div key={step.id} className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 relative overflow-hidden">
              <div className="blur-sm select-none pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 ltr-nums flex-shrink-0">
                    {step.stepOrder}
                  </span>
                  <span className="font-medium text-slate-400">{title}</span>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                <div className="text-center">
                  <span className="text-2xl">🔒</span>
                  <p className="text-sm font-medium text-slate-600 mt-1">
                    {locale === 'ar' ? 'مقفل' : 'Bloqueado'}
                  </p>
                </div>
              </div>
            </div>
          )
        }

        return (
          <div
            key={step.id}
            className={`rounded-2xl border-2 p-5 transition-all ${STATUS_STYLES[step.status] || STATUS_STYLES.pending}`}
          >
            <div className="flex items-start gap-4">
              {/* Step number / status icon */}
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'done' ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm">
                    ✓
                  </div>
                ) : step.status === 'in_progress' ? (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold ltr-nums">
                    {step.stepOrder}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold ltr-nums">
                    {step.stepOrder}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      step.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : step.status === 'in_progress'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {t(locale, `roadmap.step_${step.status}`)}
                  </span>
                </div>

                {step.status !== 'done' && (
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{description}</p>
                )}

                {step.status !== 'done' && (
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    {step.procedureSlug && (
                      <Link
                        href={`/${locale}/procedures/${step.procedureSlug}`}
                        className="text-sm text-indigo-600 font-medium hover:underline"
                      >
                        📖 {t(locale, 'roadmap.read_guide')}
                      </Link>
                    )}
                    <button
                      onClick={() => markDone(step.id)}
                      disabled={loading === step.id}
                      className="text-sm bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {loading === step.id ? '...' : `✓ ${t(locale, 'roadmap.mark_done')}`}
                    </button>
                  </div>
                )}

                {step.status === 'done' && step.completedAt && (
                  <p className="text-xs text-emerald-600 mt-1">
                    {locale === 'ar' ? 'مكتملة' : 'Completado'} ✓
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Upgrade prompt after locked steps */}
      {!isPaid && steps.length > freeLimit && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 text-center">
          <p className="font-semibold text-lg mb-1">{t(locale, 'roadmap.locked_title')}</p>
          <p className="text-slate-300 text-sm mb-4">{t(locale, 'roadmap.locked_desc')}</p>
          <Link
            href={`/${locale}/profile`}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
          >
            ⭐ {t(locale, 'roadmap.upgrade_cta')}
          </Link>
        </div>
      )}
    </div>
  )
}
