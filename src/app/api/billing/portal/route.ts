import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPortalSession } from '@/lib/stripe'

export async function POST() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ success: false, error: 'No subscription found' }, { status: 404 })
    }

    const portalUrl = await createPortalSession(subscription.stripeCustomerId)
    return NextResponse.json({ success: true, data: { portalUrl } })
  } catch (err) {
    console.error('Portal error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
