'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { t } from '@/lib/i18n'
import type { Locale, IntakeAnswers } from '@/lib/types'

interface Props {
  locale: Locale
  currentStep: number
}

const TOTAL_STEPS = 7

const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao', 'Zaragoza']

export function IntakeForm({ locale, currentStep }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(currentStep)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Partial<IntakeAnswers>>({})
  const [error, setError] = useState('')

  function updateAnswer(key: keyof IntakeAnswers, value: any) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return !!answers.arrivalDate
      case 1: return !!answers.cityInSpain
      case 2: return !!answers.immigrationStatus
      case 3: return answers.hasEmpadronamiento !== undefined
      case 4: return answers.hasNIE !== undefined
      case 5: return answers.isWorking !== undefined
      case 6: return !!answers.preferredLanguage
      default: return false
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!res.ok) throw new Error('Failed')
      router.push(`/${locale}/dashboard`)
      router.refresh()
    } catch {
      setError(t(locale, 'common.error'))
      setSubmitting(false)
    }
  }

  const progressPct = Math.round(((step + 1) / TOTAL_STEPS) * 100)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100">
        <div
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="p-8">
        <p className="text-sm text-slate-400 mb-6">
          {t(locale, 'onboarding.step', { current: String(step + 1), total: String(TOTAL_STEPS) })}
        </p>

        {/* Step 0 — Arrival date */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">{t(locale, 'onboarding.q1_title')}</h2>
            <input
              type="date"
              value={answers.arrivalDate || ''}
              onChange={(e) => updateAnswer('arrivalDate', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              dir="ltr"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}

        {/* Step 1 — City */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">{t(locale, 'onboarding.q2_title')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => updateAnswer('cityInSpain', city)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium text-start ${
                    answers.cityInSpain === city
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {city}
                </button>
              ))}
              <button
                type="button"
                onClick={() => updateAnswer('cityInSpain', 'Otra')}
                className={`px-4 py-3 rounded-xl border text-sm font-medium text-start ${
                  answers.cityInSpain === 'Otra'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {locale === 'ar' ? 'مدينة أخرى' : 'Otra ciudad'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Immigration status */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">{t(locale, 'onboarding.q3_title')}</h2>
            <div className="space-y-3">
              {[
                { value: 'tourist_visa', label: t(locale, 'onboarding.status_tourist') },
                { value: 'work_visa', label: t(locale, 'onboarding.status_work') },
                { value: 'student_visa', label: t(locale, 'onboarding.status_student') },
                { value: 'irregular', label: t(locale, 'onboarding.status_irregular') },
                { value: 'other', label: t(locale, 'onboarding.status_other') },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateAnswer('immigrationStatus', opt.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-start ${
                    answers.immigrationStatus === opt.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Empadronamiento */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">{t(locale, 'onboarding.q4_title')}</h2>
            <p className="text-sm text-slate-500 mb-6">
              {locale === 'ar'
                ? 'التسجيل في بلدية مدينتك — وثيقة أساسية لجميع الإجراءات'
                : 'Registro en el padrón municipal — documento esencial para todos los trámites'}
            </p>
            <div className="space-y-3">
              {[
                { value: true, label: t(locale, 'onboarding.yes') },
                { value: false, label: t(locale, 'onboarding.no') },
                { value: null, label: t(locale, 'onboarding.not_sure') },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => updateAnswer('hasEmpadronamiento', opt.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-start ${
                    answers.hasEmpadronamiento === opt.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — NIE/TIE */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">{t(locale, 'onboarding.q5_title')}</h2>
            <div className="space-y-3">
              {[
                { hasNIE: true, hasTIE: false, label: t(locale, 'onboarding.nie') },
                { hasNIE: true, hasTIE: true, label: t(locale, 'onboarding.tie') },
                { hasNIE: false, hasTIE: false, label: t(locale, 'onboarding.neither') },
                { hasNIE: null, hasTIE: null, label: t(locale, 'onboarding.not_sure') },
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    updateAnswer('hasNIE', opt.hasNIE)
                    updateAnswer('hasTIE', opt.hasTIE)
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-start ${
                    answers.hasNIE === opt.hasNIE && answers.hasTIE === opt.hasTIE
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 — Working */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">{t(locale, 'onboarding.q6_title')}</h2>
            <div className="space-y-3">
              {[
                { value: true, label: t(locale, 'onboarding.working_formal') },
                { value: 'informal', label: t(locale, 'onboarding.working_informal') },
                { value: false, label: t(locale, 'onboarding.not_working') },
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => updateAnswer('isWorking', opt.value === 'informal' ? true : opt.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-start ${
                    answers.isWorking === (opt.value === 'informal' ? true : opt.value)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6 — Language */}
        {step === 6 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">{t(locale, 'onboarding.q7_title')}</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => updateAnswer('preferredLanguage', 'ar')}
                className={`w-full px-4 py-4 rounded-xl border text-sm font-medium text-start flex items-center gap-3 ${
                  answers.preferredLanguage === 'ar'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">🇸🇦</span>
                <span>{t(locale, 'onboarding.lang_ar')} — العربية</span>
              </button>
              <button
                type="button"
                onClick={() => updateAnswer('preferredLanguage', 'es')}
                className={`w-full px-4 py-4 rounded-xl border text-sm font-medium text-start flex items-center gap-3 ${
                  answers.preferredLanguage === 'es'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">🇪🇸</span>
                <span>{t(locale, 'onboarding.lang_es')} — Español</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
            >
              {t(locale, 'onboarding.btn_back')}
            </button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={() => canProceed() && setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t(locale, 'onboarding.btn_next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => canProceed() && handleSubmit()}
              disabled={!canProceed() || submitting}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t(locale, 'onboarding.generating') : t(locale, 'onboarding.btn_submit')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
