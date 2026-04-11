import Link from 'next/link'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

interface Props {
  locale: Locale
}

const mobileNav = (locale: Locale) => [
  { href: `/${locale}/dashboard`, icon: '🏠', label: t(locale, 'nav.home') },
  { href: `/${locale}/roadmap`, icon: '🗺️', label: t(locale, 'nav.roadmap') },
  { href: `/${locale}/documents`, icon: '📄', label: t(locale, 'nav.documents') },
  { href: `/${locale}/procedures`, icon: '📖', label: t(locale, 'nav.procedures') },
  { href: `/${locale}/profile`, icon: '👤', label: t(locale, 'nav.profile') },
]

export function MobileNav({ locale }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-30 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNav(locale).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
