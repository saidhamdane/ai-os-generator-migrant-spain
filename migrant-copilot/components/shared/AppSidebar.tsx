import Link from 'next/link'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { SignOutButton } from './SignOutButton'

interface Props {
  locale: Locale
  userName: string
}

const navItems = (locale: Locale) => [
  { href: `/${locale}/dashboard`, icon: '🏠', label: t(locale, 'nav.home') },
  { href: `/${locale}/roadmap`, icon: '🗺️', label: t(locale, 'nav.roadmap') },
  { href: `/${locale}/documents`, icon: '📄', label: t(locale, 'nav.documents') },
  { href: `/${locale}/procedures`, icon: '📖', label: t(locale, 'nav.procedures') },
  { href: `/${locale}/reminders`, icon: '🔔', label: t(locale, 'nav.reminders') },
  { href: `/${locale}/profile`, icon: '👤', label: t(locale, 'nav.profile') },
]

export function AppSidebar({ locale, userName }: Props) {
  return (
    <aside className="hidden md:flex fixed top-0 ltr:left-0 rtl:right-0 h-full w-64 bg-white border-e border-slate-100 flex-col z-30">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">م</span>
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">MigrantCopilot</div>
            <div className="text-xs text-slate-500 truncate max-w-[130px]">{userName}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems(locale).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium group"
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Upgrade CTA for sidebar */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href={`/${locale}/profile`}
          className="block bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-3 rounded-xl text-center"
        >
          ⭐ {t(locale, 'nav.upgrade')}
        </Link>
        <div className="mt-2">
          <SignOutButton locale={locale} />
        </div>
      </div>
    </aside>
  )
}
