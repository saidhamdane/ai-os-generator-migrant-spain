import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPaidUser } from '@/lib/subscription'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { ChecklistView } from '@/components/checklist/ChecklistView'

const FREE_ITEM_LIMIT = 3

export default async function DocumentsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/login`)

  const roadmap = await prisma.roadmap.findFirst({
    where: { userId: session.user.id, status: 'active' },
    include: {
      checklist: {
        include: {
          items: { orderBy: [{ stepCategory: 'asc' }, { itemOrder: 'asc' }] },
        },
      },
    },
  })

  if (!roadmap?.checklist) redirect(`/${locale}/onboarding`)

  const paid = await isPaidUser(session.user.id)
  const items = roadmap.checklist.items

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t(locale, 'documents.title')}</h1>
        <p className="text-slate-500 mt-1">{t(locale, 'documents.subtitle')}</p>
      </div>

      <ChecklistView
        items={items}
        locale={locale}
        isPaid={paid}
        freeLimit={FREE_ITEM_LIMIT}
        checklistId={roadmap.checklist.id}
      />
    </div>
  )
}
