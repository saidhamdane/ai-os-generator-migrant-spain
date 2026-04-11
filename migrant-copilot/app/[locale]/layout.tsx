import { SessionProvider } from '@/components/providers/SessionProvider'

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return <SessionProvider>{children}</SessionProvider>
}
