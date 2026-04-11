'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export default function SignupPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, locale }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t(locale, 'common.error'))
        setLoading(false)
        return
      }

      // Auto sign in after registration
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      router.push(`/${locale}/onboarding`)
      router.refresh()
    } catch {
      setError(t(locale, 'common.error'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">م</span>
            </div>
            <span className="font-bold text-slate-800 text-xl">MigrantCopilot</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-6">{t(locale, 'auth.signup_title')}</h1>
          <p className="text-slate-500 text-sm mt-2">
            {locale === 'ar' ? 'أنشئ حسابك المجاني في ثوانٍ' : 'Crea tu cuenta gratuita en segundos'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t(locale, 'auth.full_name')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
                placeholder={locale === 'ar' ? 'أحمد العمراني' : 'Ahmed El Amrani'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t(locale, 'auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
                placeholder="ahmed@email.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t(locale, 'auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
                placeholder="••••••••"
                dir="ltr"
              />
              <p className="text-xs text-slate-400 mt-1">
                {locale === 'ar' ? '8 أحرف على الأقل' : 'Mínimo 8 caracteres'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t(locale, 'common.loading') : t(locale, 'auth.btn_signup')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t(locale, 'auth.have_account')}{' '}
            <Link href={`/${locale}/login`} className="text-indigo-600 font-medium hover:underline">
              {t(locale, 'auth.btn_login')}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          <Link href={`/${locale}`} className="hover:underline">
            {locale === 'ar' ? '← العودة للرئيسية' : '← Volver al inicio'}
          </Link>
        </p>
      </div>
    </div>
  )
}
