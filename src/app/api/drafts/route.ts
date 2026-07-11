import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { projectDraftSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = projectDraftSchema.parse(body)

    const draft = await prisma.projectDraft.create({
      data: {
        userId: session.user.id,
        formData: validated.formData as any,
        step: validated.step || 1,
      },
    })

    return NextResponse.json({
      data: { id: draft.id },
      message: 'Draft saved',
    })
  } catch (error) {
    console.error('Create draft error:', error)
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const drafts = await prisma.projectDraft.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ data: drafts })
  } catch (error) {
    console.error('Get drafts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
}
