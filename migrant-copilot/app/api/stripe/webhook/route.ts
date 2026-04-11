import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true })
  }

  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: import('stripe').Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const cs = event.data.object as import('stripe').Stripe.Checkout.Session
      const userId = cs.metadata?.userId
      if (userId && cs.subscription) {
        await prisma.subscription.upsert({
          where: { providerSubscriptionId: cs.subscription as string },
          create: {
            userId,
            provider: 'stripe',
            providerCustomerId: cs.customer as string,
            providerSubscriptionId: cs.subscription as string,
            plan: 'monthly',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          update: { status: 'active' },
        })
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as import('stripe').Stripe.Subscription
      await prisma.subscription.updateMany({
        where: { providerSubscriptionId: sub.id },
        data: {
          status: sub.status as any,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      })
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as import('stripe').Stripe.Subscription
      await prisma.subscription.updateMany({
        where: { providerSubscriptionId: sub.id },
        data: { status: 'canceled' },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
