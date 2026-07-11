import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, jobId, projectName } = body

    if (!userId || !jobId || !projectName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    await prisma.webhookEvent.create({
      data: {
        userId,
        event: 'generation.completed',
        payload: JSON.stringify(body),
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
