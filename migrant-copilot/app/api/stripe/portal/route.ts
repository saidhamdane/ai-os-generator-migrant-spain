import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/ar/login', req.url))
  }

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_...')) {
    const locale = req.headers.get('referer')?.includes('/es/') ? 'es' : 'ar'
    return NextResponse.redirect(new URL(`/${locale}/profile`, req.url))
  }

  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

    const sub = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    if (!sub?.providerCustomerId) {
      const locale = req.headers.get('referer')?.includes('/es/') ? 'es' : 'ar'
      return NextResponse.redirect(new URL(`/${locale}/profile`, req.url))
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const locale = req.headers.get('referer')?.includes('/es/') ? 'es' : 'ar'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.providerCustomerId,
      return_url: `${appUrl}/${locale}/profile`,
    })

    return NextResponse.redirect(portalSession.url, 303)
  } catch (err) {
    console.error('Stripe portal error:', err)
    return NextResponse.json({ error: 'Portal error' }, { status: 500 })
  }
}
