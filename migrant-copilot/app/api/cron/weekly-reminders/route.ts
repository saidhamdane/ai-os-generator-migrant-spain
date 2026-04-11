import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Weekly reminder email cron — runs every Monday at 09:00 (Europe/Madrid)
 * Configured in vercel.json: "0 9 * * 1"
 *
 * Sends a summary email of all pending reminders due in the next 7 days.
 * In demo mode (no RESEND_API_KEY) it logs instead of sending.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Find all pending reminders due in the next 7 days
  const reminders = await prisma.reminder.findMany({
    where: {
      status: 'pending',
      remindAt: { gte: now, lte: in7Days },
    },
    include: {
      user: {
        select: { email: true, fullName: true, preferredLanguage: true },
      },
    },
    orderBy: { remindAt: 'asc' },
  })

  if (reminders.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No reminders due this week.' })
  }

  // Group by user
  const byUser = reminders.reduce<Record<string, typeof reminders>>(
    (acc, r) => {
      if (!acc[r.userId]) acc[r.userId] = []
      acc[r.userId].push(r)
      return acc
    },
    {}
  )

  let sent = 0

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_...') {
    // Demo mode — log only
    console.log(`[Cron] Weekly reminders — ${Object.keys(byUser).length} users, ${reminders.length} reminders (demo: no email sent)`)
    return NextResponse.json({
      sent: 0,
      demo: true,
      users: Object.keys(byUser).length,
      reminders: reminders.length,
    })
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@migrantcopilot.es'

  for (const [, userReminders] of Object.entries(byUser)) {
    const user = userReminders[0].user
    const locale = user.preferredLanguage || 'ar'
    const isAr = locale === 'ar'

    const subject = isAr
      ? `📅 تذكيراتك هذا الأسبوع — MigrantCopilot`
      : `📅 Tus recordatorios de esta semana — MigrantCopilot`

    const itemsHtml = userReminders
      .map((r) => {
        const title = isAr ? r.titleAr : r.titleEs
        const date = r.remindAt.toLocaleDateString(isAr ? 'ar-MA' : 'es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
        return `<li style="margin-bottom:8px"><strong>${title}</strong><br><span style="color:#6b7280">${date}</span></li>`
      })
      .join('')

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;direction:${isAr ? 'rtl' : 'ltr'}">
        <div style="background:#4f46e5;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;font-size:20px;margin:0">MigrantCopilot</h1>
        </div>
        <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px">
          <p style="color:#1e293b;font-size:16px">
            ${isAr ? `مرحباً ${user.fullName || ''}،` : `Hola ${user.fullName || ''},`}
          </p>
          <p style="color:#475569">
            ${isAr ? 'هذه تذكيراتك المجدولة هذا الأسبوع:' : 'Estos son tus recordatorios programados esta semana:'}
          </p>
          <ul style="padding-${isAr ? 'right' : 'left'}:20px;color:#1e293b">
            ${itemsHtml}
          </ul>
          <div style="margin-top:24px;text-align:center">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${locale}/reminders"
               style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
              ${isAr ? 'عرض التذكيرات' : 'Ver recordatorios'}
            </a>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;text-align:center">
            MigrantCopilot · ${isAr ? 'إلغاء الاشتراك' : 'Cancelar suscripción'}
          </p>
        </div>
      </div>
    `

    try {
      await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject,
        html,
      })
      sent++
    } catch (err) {
      console.error(`Failed to send reminder to ${user.email}:`, err)
    }
  }

  return NextResponse.json({ sent, total: Object.keys(byUser).length })
}
