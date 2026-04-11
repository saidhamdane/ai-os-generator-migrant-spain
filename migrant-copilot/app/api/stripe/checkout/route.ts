import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/ar/login', req.url))
  }

  // Demo mode: Stripe not configured
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_...')) {
    // In demo mode, redirect to a mock success page
    const locale = req.headers.get('referer')?.includes('/es/') ? 'es' : 'ar'
    return NextResponse.redirect(new URL(`/${locale}/profile?upgraded=demo`, req.url))
  }

  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const locale = req.headers.get('referer')?.includes('/es/') ? 'es' : 'ar'

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_MONTHLY!,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/${locale}/dashboard?success=1`,
      cancel_url: `${appUrl}/${locale}/profile`,
      metadata: { userId: session.user.id },
    })

    return NextResponse.redirect(checkoutSession.url!, 303)
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Payment error' }, { status: 500 })
  }
}
