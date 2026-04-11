import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const guides = await prisma.procedureGuide.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }],
  })
  return NextResponse.json({ guides })
}
