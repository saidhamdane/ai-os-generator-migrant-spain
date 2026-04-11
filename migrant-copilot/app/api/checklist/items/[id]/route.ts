import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()
  const validStatuses = ['missing', 'ready', 'needs_translation', 'not_applicable']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Verify ownership via checklist → roadmap → user
  const item = await prisma.checklistItem.findUnique({
    where: { id: params.id },
    include: { checklist: { include: { roadmap: true } } },
  })

  if (!item || item.checklist.roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.checklistItem.update({
    where: { id: params.id },
    data: { status },
  })

  return NextResponse.json({ item: updated })
}
