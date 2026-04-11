'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export default function LoginPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(locale === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push(`/${locale}/dashboard`)
    router.refresh()
  }

  function fillDemo() {
    setEmail('demo@migrantcopilot.es')
    setPassword('demo1234')
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
          <h1 className="text-2xl font-bold text-slate-900 mt-6">{t(locale, 'auth.login_title')}</h1>
        </div>

        {/* Demo box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-1">{t(locale, 'auth.demo_title')}</p>
          <p className="text-xs text-amber-700 mb-3">{t(locale, 'auth.demo_desc')}</p>
          <div className="space-y-1 text-xs font-mono text-amber-800">
            <div>📧 {t(locale, 'auth.demo_email')}</div>
            <div>🔑 {t(locale, 'auth.demo_pass')}</div>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="mt-3 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg font-medium"
          >
            {locale === 'ar' ? 'ملء البيانات التجريبية' : 'Rellenar datos demo'}
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
                placeholder="••••••••"
                dir="ltr"
              />
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
              {loading ? t(locale, 'common.loading') : t(locale, 'auth.btn_login')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t(locale, 'auth.no_account')}{' '}
            <Link href={`/${locale}/signup`} className="text-indigo-600 font-medium hover:underline">
              {t(locale, 'landing.cta_start')}
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
