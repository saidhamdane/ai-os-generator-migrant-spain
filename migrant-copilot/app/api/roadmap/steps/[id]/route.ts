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
  const validStatuses = ['pending', 'in_progress', 'done', 'skipped']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Verify ownership
  const step = await prisma.roadmapStep.findUnique({
    where: { id: params.id },
    include: { roadmap: true },
  })

  if (!step || step.roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.roadmapStep.update({
    where: { id: params.id },
    data: {
      status,
      completedAt: status === 'done' ? new Date() : null,
    },
  })

  return NextResponse.json({ step: updated })
}
