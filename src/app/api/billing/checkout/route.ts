import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCheckoutSession, createCreditPackCheckout, createLifetimeCheckout } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: userId, email } = session.user
  const { plan, type, packType } = await req.json()

  let url: string

  if (type === 'credit-pack') {
    url = await createCreditPackCheckout(userId, email, packType)
  } else if (type === 'lifetime') {
    url = await createLifetimeCheckout(userId, email)
  } else {
    url = await createCheckoutSession(userId, email, plan ?? 'maker')
  }

  return NextResponse.json({ url })
}
