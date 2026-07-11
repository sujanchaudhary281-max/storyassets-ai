import Stripe from 'stripe'
import { prisma } from './prisma'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })

export type Plan = 'starter' | 'maker' | 'pro' | 'agency'

export const PLAN_LIMITS: Record<Plan, { monthlyGenerations: number; maxProjects: number; maxLanguages: number; features: string[] }> = {
  starter: { monthlyGenerations: 3, maxProjects: 1, maxLanguages: 1, features: [] },
  maker: { monthlyGenerations: 60, maxProjects: 3, maxLanguages: 3, features: ['full-res export'] },
  pro: { monthlyGenerations: 300, maxProjects: 999, maxLanguages: 99, features: ['full-res export', 'version history', 'A/B variants', 'API read access'] },
  agency: { monthlyGenerations: 999, maxProjects: 999, maxLanguages: 99, features: ['full-res export', 'version history', 'A/B variants', 'full API', '5 team seats', 'client workspaces', 'white-label'] },
}

const PLAN_PRICE_ENV: Record<Plan, string> = {
  starter: 'STRIPE_STARTER_PRICE_ID',
  maker: 'STRIPE_MAKER_PRICE_ID',
  pro: 'STRIPE_PRO_PRICE_ID',
  agency: 'STRIPE_AGENCY_PRICE_ID',
}

export async function createCheckoutSession(userId: string, email: string, plan: Plan): Promise<string> {
  const customerId = await getOrCreateCustomer(userId, email)
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env[PLAN_PRICE_ENV[plan]]!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { userId, plan },
  })
  return session.url!
}

export async function createCreditPackCheckout(userId: string, email: string, packType: '50' | '200'): Promise<string> {
  const customerId = await getOrCreateCustomer(userId, email)
  const priceId = packType === '50' ? process.env.STRIPE_CREDIT_50_PRICE_ID! : process.env.STRIPE_CREDIT_200_PRICE_ID!
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { userId, packType },
  })
  return session.url!
}

export async function createLifetimeCheckout(userId: string, email: string): Promise<string> {
  const customerId = await getOrCreateCustomer(userId, email)
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_LIFETIME_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { userId },
  })
  return session.url!
}

export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  })
  return session.url
}

export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const sub = await prisma.subscription.findUnique({ where: { userId } })
  if (sub?.stripeCustomerId) return sub.stripeCustomerId
  const customer = await stripe.customers.create({ email, metadata: { userId } })
  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, stripeCustomerId: customer.id, plan: 'free', status: 'active' },
    update: { stripeCustomerId: customer.id },
  })
  return customer.id
}
