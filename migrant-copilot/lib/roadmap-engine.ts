import type { UserProfile } from '@prisma/client'
import type { RoadmapStepInput } from './types'
import {
  STEP_EMPADRONAMIENTO,
  STEP_NIE,
  STEP_TIE,
  STEP_SOCIAL_SECURITY,
  STEP_BANK_ACCOUNT,
  STEP_HEALTH_CARD,
  STEP_SEPE,
} from './roadmap-steps'

/**
 * Generates an ordered list of steps based on the user's intake profile.
 * Pure function — deterministic, no side effects, no LLM.
 */
export function generateRoadmap(profile: UserProfile): RoadmapStepInput[] {
  const steps: Omit<RoadmapStepInput, 'stepOrder'>[] = []

  // Always start with empadronamiento if not done
  if (!profile.hasEmpadronamiento) {
    steps.push(STEP_EMPADRONAMIENTO)
  }

  // NIE: needs empadronamiento first (or already has it)
  if (!profile.hasNIE) {
    steps.push(STEP_NIE)
  }

  // TIE: non-EU only, needs NIE
  if (profile.isNonEU && !profile.hasTIE) {
    steps.push(STEP_TIE)
  }

  // Social Security: needs NIE
  if (!profile.hasSocialSecurity) {
    steps.push(STEP_SOCIAL_SECURITY)
  }

  // Bank account: useful early, needs NIE ideally
  steps.push(STEP_BANK_ACCOUNT)

  // Health card: needs Social Security
  steps.push(STEP_HEALTH_CARD)

  // SEPE: only for people actively looking for work
  if (!profile.isWorking) {
    steps.push(STEP_SEPE)
  }

  return steps.map((step, index) => ({
    ...step,
    stepOrder: index + 1,
  }))
}

export function getRoadmapTitle(locale: 'ar' | 'es'): string {
  return locale === 'ar' ? 'خطتك الشخصية في إسبانيا' : 'Tu Plan Personal en España'
}

export function getRoadmapSummary(locale: 'ar' | 'es'): string {
  return locale === 'ar'
    ? 'خطوات مرتبة بناءً على وضعك الحالي. أكمل كل خطوة للانتقال إلى التالية.'
    : 'Pasos ordenados según tu situación actual. Completa cada paso para avanzar al siguiente.'
}
