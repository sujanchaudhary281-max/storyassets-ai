import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const startTs = (sub as unknown as Record<string, unknown>).current_period_start as number | undefined
        const endTs = (sub as unknown as Record<string, unknown>).current_period_end as number | undefined
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: sub.id,
            plan: 'pro',
            status: sub.status === 'active' ? 'active' : sub.status,
            ...(startTs && { currentPeriodStart: new Date(startTs * 1000) }),
            ...(endTs && { currentPeriodEnd: new Date(endTs * 1000) }),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        })
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: 'free', status: 'canceled' },
        })
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subscription = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } })
        if (subscription) {
          await prisma.user.update({ where: { id: subscription.userId }, data: { creditBalance: 30 } })
        }
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: 'past_due' },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
