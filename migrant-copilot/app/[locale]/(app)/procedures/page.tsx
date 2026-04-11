import { prisma } from '@/lib/prisma'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { ProcedureList } from '@/components/procedures/ProcedureList'

export default async function ProceduresPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale

  const guides = await prisma.procedureGuide.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t(locale, 'procedures.title')}</h1>
        <p className="text-slate-500 mt-1">{t(locale, 'procedures.subtitle')}</p>
      </div>

      <ProcedureList guides={guides} locale={locale} />
    </div>
  )
}
