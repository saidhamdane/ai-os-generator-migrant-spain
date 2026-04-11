'use client'

import { signOut } from 'next-auth/react'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export function SignOutButton({ locale }: { locale: Locale }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
      className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-2"
    >
      {t(locale, 'nav.logout')}
    </button>
  )
}
