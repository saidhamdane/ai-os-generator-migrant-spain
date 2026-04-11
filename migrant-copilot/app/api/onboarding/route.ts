import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateRoadmap, getRoadmapTitle, getRoadmapSummary } from '@/lib/roadmap-engine'
import { generateChecklist } from '@/lib/checklist-engine'
import type { IntakeAnswers } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: IntakeAnswers = await req.json()
    const userId = session.user.id
    const locale = body.preferredLanguage || 'ar'

    // Upsert user profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : null,
        immigrationStatus: (body.immigrationStatus as any) || null,
        cityInSpain: body.cityInSpain || null,
        hasEmpadronamiento: body.hasEmpadronamiento === true,
        hasNIE: body.hasNIE === true,
        hasTIE: body.hasTIE === true,
        hasSocialSecurity: false,
        isWorking: body.isWorking === true,
        isNonEU: true,
        needsTranslationHelp: locale === 'ar',
        intakeCompleted: true,
        intakeStep: 7,
      },
      update: {
        arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : null,
        immigrationStatus: (body.immigrationStatus as any) || null,
        cityInSpain: body.cityInSpain || null,
        hasEmpadronamiento: body.hasEmpadronamiento === true,
        hasNIE: body.hasNIE === true,
        hasTIE: body.hasTIE === true,
        isWorking: body.isWorking === true,
        needsTranslationHelp: locale === 'ar',
        intakeCompleted: true,
        intakeStep: 7,
      },
    })

    // Update user preferred language
    await prisma.user.update({
      where: { id: userId },
      data: {
        preferredLanguage: locale === 'es' ? 'es' : 'ar',
        cityInSpain: body.cityInSpain || null,
      },
    })

    // Archive old roadmaps
    await prisma.roadmap.updateMany({
      where: { userId, status: 'active' },
      data: { status: 'archived' },
    })

    // Generate new roadmap
    const stepInputs = generateRoadmap(profile)

    const roadmap = await prisma.roadmap.create({
      data: {
        userId,
        title: getRoadmapTitle(locale),
        summary: getRoadmapSummary(locale),
        status: 'active',
        steps: {
          create: stepInputs.map((step) => ({
            titleAr: step.titleAr,
            titleEs: step.titleEs,
            descriptionAr: step.descriptionAr,
            descriptionEs: step.descriptionEs,
            category: step.category as any,
            procedureSlug: step.procedureSlug || null,
            stepOrder: step.stepOrder,
            priority: step.priority,
            status: 'pending',
          })),
        },
      },
      include: { steps: true },
    })

    // Generate checklist
    const slugs = roadmap.steps.map((s) => s.procedureSlug)
    const checklistItems = generateChecklist(slugs)

    await prisma.documentChecklist.create({
      data: {
        roadmapId: roadmap.id,
        items: {
          create: checklistItems.map((item) => ({
            nameAr: item.nameAr,
            nameEs: item.nameEs,
            descriptionAr: item.descriptionAr || null,
            descriptionEs: item.descriptionEs || null,
            stepCategory: item.stepCategory as any,
            isRequired: item.isRequired,
            needsTranslation: item.needsTranslation,
            itemOrder: item.itemOrder,
            status: 'missing',
          })),
        },
      },
    })

    // Create reminders for roadmap steps
    const now = new Date()
    await prisma.reminder.createMany({
      data: roadmap.steps.slice(0, 3).map((step, idx) => {
        const remindAt = new Date(now)
        remindAt.setDate(remindAt.getDate() + (idx + 1) * 7)
        return {
          userId,
          titleAr: step.titleAr,
          titleEs: step.titleEs,
          remindAt,
          status: 'pending',
        }
      }),
    })

    return NextResponse.json({ success: true, roadmapId: roadmap.id }, { status: 201 })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
