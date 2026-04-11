import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPPORTED_LOCALES = ['ar', 'es']
const DEFAULT_LOCALE = 'ar'

// Protected paths require authentication
const PROTECTED_PREFIXES = ['/onboarding', '/dashboard', '/roadmap', '/documents', '/procedures', '/reminders', '/profile']

function getLocaleFromPath(pathname: string): string {
  const segment = pathname.split('/')[1]
  return SUPPORTED_LOCALES.includes(segment) ? segment : DEFAULT_LOCALE
}

function isProtectedPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(ar|es)/, '') || '/'
  return PROTECTED_PREFIXES.some((p) => withoutLocale === p || withoutLocale.startsWith(p + '/'))
}

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Redirect root to default locale
    if (pathname === '/') {
      return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, req.url))
    }

    // Redirect bare locale (e.g. /ar → /ar/dashboard or /ar landing)
    if (pathname === '/ar' || pathname === '/es') {
      // Let it through — the page at /[locale] is the landing page
      const locale = getLocaleFromPath(pathname)
      const response = NextResponse.next()
      response.headers.set('x-locale', locale)
      return response
    }

    const locale = getLocaleFromPath(pathname)
    const response = NextResponse.next()
    response.headers.set('x-locale', locale)
    return response
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl
        if (isProtectedPath(pathname)) {
          return !!token
        }
        return true
      },
    },
    pages: {
      signIn: '/ar/login',
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/procedures).*)',
  ],
}
