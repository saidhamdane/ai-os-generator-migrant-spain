import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Demo User ───────────────────────────────────────────────
  const passwordHash = await hash('demo1234', 12)

  const demo = await prisma.user.upsert({
    where: { email: 'demo@migrantcopilot.es' },
    update: {},
    create: {
      email: 'demo@migrantcopilot.es',
      passwordHash,
      fullName: 'أحمد التازي',
      preferredLanguage: 'ar',
      cityInSpain: 'Madrid',
    },
  })

  // ─── Demo Profile ────────────────────────────────────────────
  const profile = await prisma.userProfile.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      arrivalDate: new Date('2024-03-01'),
      immigrationStatus: 'tourist_visa',
      cityInSpain: 'Madrid',
      hasEmpadronamiento: false,
      hasNIE: false,
      hasTIE: false,
      hasSocialSecurity: false,
      isWorking: false,
      isNonEU: true,
      needsTranslationHelp: true,
      intakeCompleted: true,
      intakeStep: 7,
    },
  })

  // ─── Demo Roadmap ─────────────────────────────────────────────
  const existing = await prisma.roadmap.findFirst({
    where: { userId: demo.id, status: 'active' },
  })

  if (!existing) {
    const roadmap = await prisma.roadmap.create({
      data: {
        userId: demo.id,
        title: 'خطتك الشخصية في إسبانيا',
        summary: 'خطوات مرتبة بناءً على وضعك الحالي.',
        status: 'active',
        steps: {
          create: [
            {
              titleAr: 'التسجيل في البلدية (Empadronamiento)',
              titleEs: 'Empadronamiento — Registro Municipal',
              descriptionAr: 'سجّل نفسك في بلدية مدينتك. هذه أول خطوة لأي إجراء رسمي في إسبانيا.',
              descriptionEs: 'Regístrate en el padrón municipal. Es el primer paso para cualquier trámite oficial.',
              category: 'registration',
              procedureSlug: 'empadronamiento',
              stepOrder: 1,
              priority: 10,
              status: 'in_progress',
            },
            {
              titleAr: 'طلب رقم التعريف الأجنبي (NIE)',
              titleEs: 'Solicitar el NIE',
              descriptionAr: 'NIE هو رقم تعريفك الضريبي في إسبانيا. تحتاجه لفتح حساب بنكي والعمل.',
              descriptionEs: 'El NIE es tu número fiscal. Lo necesitas para abrir cuenta bancaria y trabajar.',
              category: 'documentation',
              procedureSlug: 'nie',
              stepOrder: 2,
              priority: 9,
              status: 'pending',
            },
            {
              titleAr: 'طلب بطاقة الإقامة (TIE)',
              titleEs: 'Solicitar la TIE',
              descriptionAr: 'بطاقة الإقامة الرسمية. مطلوبة بعد 90 يوم من الإقامة.',
              descriptionEs: 'Tarjeta de residencia oficial. Requerida tras 90 días de estancia.',
              category: 'documentation',
              procedureSlug: 'tie',
              stepOrder: 3,
              priority: 8,
              status: 'pending',
            },
            {
              titleAr: 'التسجيل في الضمان الاجتماعي',
              titleEs: 'Afiliación a la Seguridad Social',
              descriptionAr: 'سجّل للوصول إلى الرعاية الصحية وحقوق العمل.',
              descriptionEs: 'Regístrate para acceder a la sanidad pública y derechos laborales.',
              category: 'registration',
              procedureSlug: 'seguridad-social',
              stepOrder: 4,
              priority: 7,
              status: 'pending',
            },
            {
              titleAr: 'فتح حساب بنكي',
              titleEs: 'Abrir una Cuenta Bancaria',
              descriptionAr: 'افتح حسابًا بنكيًا. بعض البنوك تقبل غير المقيمين بجواز السفر فقط.',
              descriptionEs: 'Abre una cuenta bancaria. Algunos bancos aceptan no residentes solo con pasaporte.',
              category: 'banking',
              procedureSlug: 'cuenta-bancaria',
              stepOrder: 5,
              priority: 6,
              status: 'pending',
            },
            {
              titleAr: 'طلب بطاقة الصحة (SIP / CIP)',
              titleEs: 'Solicitar la Tarjeta Sanitaria',
              descriptionAr: 'اطلب بطاقتك الصحية من المركز الصحي القريب.',
              descriptionEs: 'Solicita tu tarjeta sanitaria en el centro de salud más cercano.',
              category: 'health',
              procedureSlug: 'tarjeta-sanitaria',
              stepOrder: 6,
              priority: 5,
              status: 'pending',
            },
            {
              titleAr: 'التسجيل كباحث عن عمل (SEPE)',
              titleEs: 'Registro en el SEPE',
              descriptionAr: 'سجّل في مكتب التشغيل للبحث عن عمل والوصول إلى التدريب المهني.',
              descriptionEs: 'Regístrate en el SEPE para buscar empleo y acceder a formación profesional.',
              category: 'work',
              procedureSlug: 'sepe-demandante',
              stepOrder: 7,
              priority: 4,
              status: 'pending',
            },
          ],
        },
      },
      include: { steps: true },
    })

    // Document checklist
    await prisma.documentChecklist.create({
      data: {
        roadmapId: roadmap.id,
        items: {
          create: [
            {
              nameAr: 'جواز السفر (الأصل + نسخة)',
              nameEs: 'Pasaporte (original + fotocopia)',
              stepCategory: 'registration',
              isRequired: true,
              needsTranslation: false,
              itemOrder: 1,
              status: 'ready',
            },
            {
              nameAr: 'عقد الإيجار أو وثيقة الإقامة',
              nameEs: 'Contrato de alquiler o documento de residencia',
              descriptionAr: 'يُثبت عنوانك في إسبانيا',
              descriptionEs: 'Acredita tu domicilio en España',
              stepCategory: 'registration',
              isRequired: true,
              needsTranslation: false,
              itemOrder: 2,
              status: 'missing',
            },
            {
              nameAr: 'نموذج طلب التسجيل (مملوء)',
              nameEs: 'Formulario de empadronamiento (rellenado)',
              stepCategory: 'registration',
              isRequired: true,
              needsTranslation: false,
              itemOrder: 3,
              status: 'missing',
            },
            {
              nameAr: 'نموذج EX-15 (مملوء)',
              nameEs: 'Formulario EX-15 (rellenado)',
              stepCategory: 'documentation',
              isRequired: true,
              needsTranslation: false,
              itemOrder: 4,
              status: 'missing',
            },
            {
              nameAr: 'إيصال دفع رسوم النموذج 790',
              nameEs: 'Resguardo de pago Modelo 790',
              stepCategory: 'documentation',
              isRequired: true,
              needsTranslation: false,
              itemOrder: 5,
              status: 'missing',
            },
            {
              nameAr: 'صورة شمسية حديثة',
              nameEs: 'Fotografía tipo carné reciente',
              stepCategory: 'documentation',
              isRequired: true,
              needsTranslation: false,
              itemOrder: 6,
              status: 'missing',
            },
          ],
        },
      },
    })

    // Reminders
    const now = new Date()
    await prisma.reminder.createMany({
      data: [
        {
          userId: demo.id,
          titleAr: 'موعد طلب Empadronamiento في بلدية مدريد',
          titleEs: 'Cita para el Empadronamiento en el Ayuntamiento de Madrid',
          remindAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          status: 'pending',
        },
        {
          userId: demo.id,
          titleAr: 'موعد طلب NIE في مفوضية الشرطة',
          titleEs: 'Cita para el NIE en la Comisaría',
          remindAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
          status: 'pending',
        },
      ],
    })
  }

  // ─── Procedure Guides ─────────────────────────────────────────
  const guides = [
    {
      slug: 'empadronamiento',
      category: 'registration' as const,
      titleAr: 'التسجيل في البلدية (Empadronamiento)',
      titleEs: 'Empadronamiento — Padrón Municipal',
      shortExplanationAr: 'تسجيل رسمي في عنوانك ببلدية مدينتك في إسبانيا. مطلوب لجميع المقيمين بصرف النظر عن وضعهم القانوني.',
      shortExplanationEs: 'Registro oficial en tu dirección en el municipio español donde vives. Obligatorio para todos los residentes independientemente de su situación legal.',
      detailedAr: `الخطوات:
1. توجّه إلى مكتب بلدية مدينتك (Ayuntamiento).
2. احضر جواز سفرك الأصلي ونسخة منه.
3. احضر عقد الإيجار أو رسالة من مالك السكن تثبت إقامتك.
4. اطلب نموذج "hoja padronal" وأملأه.
5. قدّم الطلب وانتظر شهادة التسجيل (Volante de Empadronamiento).

في بعض المدن يمكن أخذ موعد مسبق عبر الموقع الإلكتروني للبلدية.`,
      detailedEs: `Pasos a seguir:
1. Acude a la oficina del Ayuntamiento de tu ciudad.
2. Lleva tu pasaporte original y fotocopia.
3. Lleva contrato de alquiler o autorización del propietario.
4. Pide la "hoja padronal" y rellénala.
5. Presenta la solicitud y espera el volante de empadronamiento.

En muchas ciudades puedes pedir cita previa por internet.`,
      importantNotesAr: '• التسجيل مجاني تمامًا.\n• يمكن تسجيل أفراد الأسرة معًا في نفس الزيارة.\n• الشهادة صالحة لمدة 3 أشهر فقط لبعض الإجراءات.',
      importantNotesEs: '• El empadronamiento es completamente gratuito.\n• Puedes empadronar a toda la familia en la misma visita.\n• El certificado tiene validez de 3 meses para algunos trámites.',
      sortOrder: 1,
    },
    {
      slug: 'nie',
      category: 'documentation' as const,
      titleAr: 'طلب رقم التعريف الأجنبي (NIE)',
      titleEs: 'Solicitud del NIE — Número de Identificación de Extranjero',
      shortExplanationAr: 'NIE هو رقم تعريفك الجبائي في إسبانيا. تحتاجه لفتح حساب بنكي، والتعاقد، والعمل.',
      shortExplanationEs: 'El NIE es tu número fiscal en España. Lo necesitas para abrir cuenta bancaria, firmar contratos y trabajar.',
      detailedAr: `الوثائق المطلوبة:
- نموذج EX-15 مملوء
- جواز سفر ساري + نسخة
- إثبات سبب الطلب (عقد عمل، إيجار، إلخ)
- إيصال دفع رسوم النموذج 790 كود 012 (حوالي 10€)
- صورة شمسية بيضاء الخلفية

الخطوات:
1. حمّل وأملأ نموذج EX-15 من موقع وزارة الداخلية.
2. ادفع الرسوم في أي بنك باستخدام نموذج 790 كود 012.
3. خذ موعدًا مسبقًا في مفوضية الشرطة أو قنصلية.
4. قدّم الطلب في الموعد المحدد.
5. احصل على رقم NIE في نفس اليوم عادةً.`,
      detailedEs: `Documentos necesarios:
- Formulario EX-15 rellenado
- Pasaporte en vigor + fotocopia
- Justificación de la necesidad (contrato, escritura, etc.)
- Resguardo de pago Modelo 790 Código 012 (aprox. 10€)
- Fotografía de carné con fondo blanco

Pasos:
1. Descarga y rellena el formulario EX-15.
2. Paga la tasa en cualquier banco con el Modelo 790 Código 012.
3. Pide cita previa en la Comisaría o Consulado.
4. Preséntate con toda la documentación.
5. Normalmente recibes el NIE el mismo día.`,
      importantNotesAr: '• النموذج EX-15 متاح مجانًا على موقع وزارة الداخلية الإسبانية.\n• بعض المدن تطلب حجز موعد إلكتروني قبل أسابيع.\n• NIE ليس وثيقة إقامة، بل رقم ضريبي فقط.',
      importantNotesEs: '• El formulario EX-15 está disponible gratis en el sitio del Ministerio del Interior.\n• En algunas ciudades hay que pedir cita con semanas de antelación.\n• El NIE no es un documento de residencia, solo un número fiscal.',
      sortOrder: 2,
    },
    {
      slug: 'tie',
      category: 'documentation' as const,
      titleAr: 'طلب بطاقة الإقامة (TIE)',
      titleEs: 'Solicitud de la TIE — Tarjeta de Identidad de Extranjero',
      shortExplanationAr: 'TIE هي بطاقة الإقامة الرسمية للمقيمين خارج دول الاتحاد الأوروبي. تصدر بعد حصولك على NIE وتجاوز 90 يومًا من الإقامة.',
      shortExplanationEs: 'La TIE es la tarjeta de residencia oficial para ciudadanos no comunitarios. Se expide tras obtener el NIE y superar los 90 días de estancia.',
      detailedAr: `الوثائق المطلوبة:
- نموذج EX-17 مملوء
- جواز سفر + نسخة
- رقم NIE
- إيصال دفع رسوم النموذج 790 كود 012
- 3 صور شمسية بيضاء الخلفية
- إثبات وضع الإقامة (تأشيرة، عقد عمل، إلخ)

الخطوات:
1. خذ موعدًا في مفوضية الشرطة.
2. أحضر جميع الوثائق المطلوبة.
3. قدّم الطلب مع الرسوم.
4. خذ بطاقتك بعد 30-45 يومًا (تُستدعى للاستلام).`,
      detailedEs: `Documentos necesarios:
- Formulario EX-17 rellenado
- Pasaporte + fotocopia
- Número de NIE
- Resguardo de tasa Modelo 790 Código 012
- 3 fotografías de carné con fondo blanco
- Acreditación del tipo de residencia (visado, contrato, etc.)

Pasos:
1. Solicita cita en la Comisaría.
2. Lleva toda la documentación.
3. Presenta la solicitud con la tasa pagada.
4. Recoge la tarjeta en 30-45 días.`,
      importantNotesAr: '• TIE مختلفة عن NIE: NIE رقم ضريبي، TIE وثيقة إقامة فعلية.\n• يجب تجديد TIE قبل انتهاء صلاحيتها.\n• الرسوم تتراوح بين 10-20€.',
      importantNotesEs: '• La TIE es diferente del NIE: el NIE es solo un número, la TIE es el documento de residencia físico.\n• Debes renovarla antes de que caduque.\n• La tasa oscila entre 10-20€.',
      sortOrder: 3,
    },
    {
      slug: 'seguridad-social',
      category: 'registration' as const,
      titleAr: 'التسجيل في الضمان الاجتماعي',
      titleEs: 'Afiliación a la Seguridad Social',
      shortExplanationAr: 'الضمان الاجتماعي يمنحك الوصول إلى الرعاية الصحية العامة وحقوق العمل في إسبانيا.',
      shortExplanationEs: 'La Seguridad Social te da acceso a la sanidad pública y a los derechos laborales en España.',
      detailedAr: `الوثائق المطلوبة:
- وثيقة تعريف (جواز / NIE / TIE)
- نسخة منها
- عقد عمل أو سبب التسجيل

الخطوات:
1. توجّه إلى أقرب مكتب للتغطية الاجتماعية (INSS / TGSS).
2. اطلب رقم الاشتراك (Número de Afiliación — NUSS).
3. إذا كان صاحب العمل هو من يسجّلك فسيقوم هو بذلك.
4. احتفظ برقمك للاستخدامات المستقبلية.`,
      detailedEs: `Documentos necesarios:
- Documento de identidad (pasaporte / NIE / TIE)
- Fotocopia
- Contrato de trabajo o motivo de afiliación

Pasos:
1. Acude a la oficina más cercana del INSS o TGSS.
2. Solicita tu Número de Afiliación (NUSS).
3. Si te da de alta un empleador, lo hará él directamente.
4. Guarda tu número para futuros trámites.`,
      importantNotesAr: '• NUSS هو رقمك الدائم في نظام الضمان الاجتماعي، لا يتغير أبدًا.\n• ضروري للحصول على بطاقة الصحة.',
      importantNotesEs: '• El NUSS es tu número permanente en la Seguridad Social, nunca cambia.\n• Es necesario para obtener la tarjeta sanitaria.',
      sortOrder: 4,
    },
    {
      slug: 'cuenta-bancaria',
      category: 'banking' as const,
      titleAr: 'فتح حساب بنكي في إسبانيا',
      titleEs: 'Abrir una Cuenta Bancaria en España',
      shortExplanationAr: 'فتح حساب بنكي ضروري لاستلام الراتب ودفع الفواتير. بعض البنوك تقبل غير المقيمين بجواز السفر فقط.',
      shortExplanationEs: 'Abrir una cuenta bancaria es esencial para recibir el sueldo y pagar facturas. Algunos bancos aceptan no residentes solo con el pasaporte.',
      detailedAr: `خيارات متاحة:

الحسابات التقليدية:
- CaixaBank، Santander، BBVA، Banco Sabadell
- تتطلب NIE في الغالب
- رسوم شهرية محتملة

الحسابات الرقمية (أسهل للمهاجرين):
- Revolut أو Wise: تُفتح عبر الهاتف فقط بجواز السفر
- N26: نفس الأمر
- مناسبة جدًا كبداية

الوثائق الموصى بها:
- جواز السفر (أصلي)
- رقم NIE إن توفر
- عنوان إقامة في إسبانيا`,
      detailedEs: `Opciones disponibles:

Banca tradicional:
- CaixaBank, Santander, BBVA, Sabadell
- Generalmente requieren NIE
- Posibles comisiones mensuales

Banca digital (más fácil para inmigrantes):
- Revolut o Wise: se abren por móvil solo con pasaporte
- N26: ídem
- Muy recomendadas como punto de partida

Documentos recomendados:
- Pasaporte (original)
- NIE si lo tienes
- Dirección postal en España`,
      importantNotesAr: '• ابدأ بـ Revolut أو Wise إذا لم يكن لديك NIE بعد.\n• انتبه للرسوم الشهرية في البنوك التقليدية.',
      importantNotesEs: '• Empieza con Revolut o Wise si aún no tienes NIE.\n• Atención a las comisiones mensuales en banca tradicional.',
      sortOrder: 5,
    },
    {
      slug: 'tarjeta-sanitaria',
      category: 'health' as const,
      titleAr: 'طلب بطاقة الصحة (SIP / CIP)',
      titleEs: 'Solicitar la Tarjeta Sanitaria (SIP / CIP)',
      shortExplanationAr: 'بطاقة الصحة تمنحك الوصول إلى الطب العام المجاني. تُطلب من المركز الصحي بعد التسجيل في الضمان الاجتماعي.',
      shortExplanationEs: 'La tarjeta sanitaria te da acceso gratuito al médico de cabecera. Se solicita en el centro de salud tras afiliarte a la Seguridad Social.',
      detailedAr: `الوثائق المطلوبة:
- رقم اشتراك الضمان الاجتماعي (NUSS)
- وثيقة تعريف (جواز / NIE / TIE)
- شهادة Empadronamiento

الخطوات:
1. توجّه إلى أقرب مركز صحي (Centro de Salud).
2. اطلب تسجيلك للحصول على طبيب الأسرة.
3. قدّم وثائقك.
4. احصل على بطاقة الصحة (SIP أو CIP حسب المنطقة).`,
      detailedEs: `Documentos necesarios:
- Número de Afiliación a la Seguridad Social (NUSS)
- Documento de identidad (pasaporte / NIE / TIE)
- Certificado de empadronamiento

Pasos:
1. Acude al centro de salud más cercano a tu domicilio.
2. Solicita ser asignado a un médico de cabecera.
3. Presenta tu documentación.
4. Recibes la tarjeta sanitaria (SIP o CIP según la comunidad).`,
      importantNotesAr: '• الخدمة مجانية لمن لديه NUSS.\n• اسم البطاقة يختلف حسب المنطقة: SIP في فالنسيا، CIP في مدريد.',
      importantNotesEs: '• El servicio es gratuito con NUSS.\n• El nombre varía por comunidad: SIP en Valencia, CIP en Madrid.',
      sortOrder: 6,
    },
    {
      slug: 'sepe-demandante',
      category: 'work' as const,
      titleAr: 'التسجيل كباحث عن عمل في SEPE',
      titleEs: 'Alta como Demandante de Empleo en el SEPE',
      shortExplanationAr: 'التسجيل في SEPE يتيح لك الوصول إلى برامج التدريب المهني وخدمات التوظيف المجانية.',
      shortExplanationEs: 'Registrarse en el SEPE te da acceso a programas de formación profesional y servicios de empleo gratuitos.',
      detailedAr: `الوثائق المطلوبة:
- وثيقة تعريف (NIE أو TIE)
- رقم NUSS

الخطوات:
1. خذ موعدًا في مكتب SEPE المحلي أو سجّل عبر الموقع sepe.es.
2. أكمل بيانات طلبك.
3. حدّد مجال بحثك عن عمل.
4. ستُشار إليك لمقابلات إرشادية دورية.

المزايا:
- الوصول إلى دورات تدريبية مجانية
- مساعدة في كتابة السيرة الذاتية
- إمكانية الاستفادة من إعانات البطالة لاحقًا`,
      detailedEs: `Documentos necesarios:
- Documento de identidad (NIE o TIE)
- Número de la Seguridad Social (NUSS)

Pasos:
1. Pide cita en la oficina SEPE local o regístrate en sepe.es.
2. Completa tus datos de demanda de empleo.
3. Especifica tu sector de búsqueda.
4. Serás convocado a entrevistas de orientación periódicas.

Beneficios:
- Acceso a cursos de formación gratuitos
- Ayuda con el currículum
- Posibilidad de acceder a prestaciones por desempleo en el futuro`,
      importantNotesAr: '• التسجيل مجاني تمامًا.\n• يجب تجديد الطلب كل 3 أشهر للحفاظ على حالة "باحث عن عمل".',
      importantNotesEs: '• El registro es completamente gratuito.\n• Debes renovar la demanda cada 3 meses para mantener el estado de demandante.',
      sortOrder: 7,
    },
  ]

  for (const guide of guides) {
    await prisma.procedureGuide.upsert({
      where: { slug: guide.slug },
      update: {
        titleAr: guide.titleAr,
        titleEs: guide.titleEs,
        shortExplanationAr: guide.shortExplanationAr,
        shortExplanationEs: guide.shortExplanationEs,
        detailedAr: guide.detailedAr,
        detailedEs: guide.detailedEs,
        importantNotesAr: guide.importantNotesAr,
        importantNotesEs: guide.importantNotesEs,
      },
      create: {
        slug: guide.slug,
        category: guide.category,
        titleAr: guide.titleAr,
        titleEs: guide.titleEs,
        shortExplanationAr: guide.shortExplanationAr,
        shortExplanationEs: guide.shortExplanationEs,
        detailedAr: guide.detailedAr,
        detailedEs: guide.detailedEs,
        importantNotesAr: guide.importantNotesAr,
        importantNotesEs: guide.importantNotesEs,
        isPublished: true,
        sortOrder: guide.sortOrder,
      },
    })
  }

  console.log('✅ Seed complete.')
  console.log(`   Demo login: demo@migrantcopilot.es / demo1234`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
