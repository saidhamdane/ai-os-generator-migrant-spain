import type { RoadmapStepInput } from './types'

// Step definitions — bilingual, deterministic
// Each step references a ProcedureGuide slug for the full explainer.

export const STEP_EMPADRONAMIENTO: Omit<RoadmapStepInput, 'stepOrder'> = {
  titleAr: 'التسجيل في البلدية (Empadronamiento)',
  titleEs: 'Empadronamiento — Registro Municipal',
  descriptionAr:
    'سجّل نفسك في بلدية مدينتك. هذه أول خطوة يجب عليك القيام بها حتى تتمكن من الوصول إلى الخدمات العامة وتقديم طلبات لاحقة.',
  descriptionEs:
    'Regístrate en el padrón municipal de tu ciudad. Es el primer paso para acceder a servicios públicos y realizar trámites posteriores.',
  category: 'registration',
  procedureSlug: 'empadronamiento',
  priority: 10,
}

export const STEP_NIE: Omit<RoadmapStepInput, 'stepOrder'> = {
  titleAr: 'طلب رقم التعريف الأجنبي (NIE)',
  titleEs: 'Solicitar el NIE — Número de Identificación de Extranjero',
  descriptionAr:
    'NIE هو رقم تعريفك الضريبي في إسبانيا. تحتاجه لفتح حساب بنكي، والعمل، وإبرام العقود. قدّم طلبك في مفوضية الشرطة باستخدام نموذج EX-15.',
  descriptionEs:
    'El NIE es tu número fiscal en España. Lo necesitas para abrir cuenta bancaria, trabajar y firmar contratos. Solicítalo en la Comisaría con el formulario EX-15.',
  category: 'documentation',
  procedureSlug: 'nie',
  priority: 9,
}

export const STEP_TIE: Omit<RoadmapStepInput, 'stepOrder'> = {
  titleAr: 'طلب بطاقة الإقامة (TIE)',
  titleEs: 'Solicitar la TIE — Tarjeta de Identidad de Extranjero',
  descriptionAr:
    'TIE هي بطاقة الإقامة الرسمية. بعد الحصول على NIE وتجاوز 90 يومًا من دخولك، يجب تقديم طلب للحصول على TIE في مفوضية الشرطة.',
  descriptionEs:
    'La TIE es tu tarjeta de residencia oficial. Tras obtener el NIE y superar los 90 días en España, debes solicitarla en Comisaría.',
  category: 'documentation',
  procedureSlug: 'tie',
  priority: 8,
}

export const STEP_SOCIAL_SECURITY: Omit<RoadmapStepInput, 'stepOrder'> = {
  titleAr: 'التسجيل في الضمان الاجتماعي',
  titleEs: 'Afiliación a la Seguridad Social',
  descriptionAr:
    'سجّل في نظام الضمان الاجتماعي للوصول إلى الرعاية الصحية وحقوق العمل. تحتاج NIE ووثيقة تعريف للتسجيل.',
  descriptionEs:
    'Regístrate en la Seguridad Social para acceder a la sanidad pública y derechos laborales. Necesitas el NIE y un documento de identidad.',
  category: 'registration',
  procedureSlug: 'seguridad-social',
  priority: 7,
}

export const STEP_BANK_ACCOUNT: Omit<RoadmapStepInput, 'stepOrder'> = {
  titleAr: 'فتح حساب بنكي',
  titleEs: 'Abrir una Cuenta Bancaria',
  descriptionAr:
    'افتح حسابًا بنكيًا في إسبانيا. بعض البنوك تقبل غير المقيمين بجواز السفر فقط. مع NIE ستحصل على حساب كامل.',
  descriptionEs:
    'Abre una cuenta bancaria en España. Algunos bancos aceptan no residentes solo con el pasaporte. Con NIE obtendrás una cuenta completa.',
  category: 'banking',
  procedureSlug: 'cuenta-bancaria',
  priority: 6,
}

export const STEP_HEALTH_CARD: Omit<RoadmapStepInput, 'stepOrder'> = {
  titleAr: 'طلب بطاقة الصحة (SIP / CIP)',
  titleEs: 'Solicitar la Tarjeta Sanitaria (SIP / CIP)',
  descriptionAr:
    'بعد التسجيل في الضمان الاجتماعي، اطلب بطاقتك الصحية من المركز الصحي القريب منك. تمنحك الوصول إلى الطب العام.',
  descriptionEs:
    'Tras afiliarte a la Seguridad Social, solicita tu tarjeta sanitaria en el centro de salud más cercano. Te da acceso al médico de cabecera.',
  category: 'health',
  procedureSlug: 'tarjeta-sanitaria',
  priority: 5,
}

export const STEP_SEPE: Omit<RoadmapStepInput, 'stepOrder'> = {
  titleAr: 'التسجيل كباحث عن عمل (SEPE)',
  titleEs: 'Registro en el SEPE como Demandante de Empleo',
  descriptionAr:
    'سجّل في مكتب التشغيل (SEPE) للبحث عن عمل والوصول إلى برامج التدريب المهني. يجب أن يكون لديك NIE.',
  descriptionEs:
    'Regístrate en el SEPE para buscar empleo y acceder a programas de formación profesional. Necesitas el NIE para inscribirte.',
  category: 'work',
  procedureSlug: 'sepe-demandante',
  priority: 4,
}
