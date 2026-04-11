export type Locale = 'ar' | 'es'
export type Dir = 'rtl' | 'ltr'

export interface IntakeAnswers {
  arrivalDate: string
  cityInSpain: string
  immigrationStatus: string
  hasEmpadronamiento: boolean | null
  hasNIE: boolean | null
  hasTIE: boolean | null
  isWorking: boolean
  preferredLanguage: 'ar' | 'es'
}

export interface RoadmapStepInput {
  titleAr: string
  titleEs: string
  descriptionAr: string
  descriptionEs: string
  category: string
  procedureSlug?: string
  stepOrder: number
  priority: number
  dueDate?: Date
}

export interface ChecklistItemInput {
  nameAr: string
  nameEs: string
  descriptionAr?: string
  descriptionEs?: string
  stepCategory: string
  isRequired: boolean
  needsTranslation: boolean
  itemOrder: number
}
