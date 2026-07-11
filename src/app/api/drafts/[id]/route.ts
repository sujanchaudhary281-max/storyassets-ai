import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { projectDraftSchema } from '@/lib/validations'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const draft = await prisma.projectDraft.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        id: draft.id,
        formData: draft.formData,
        step: draft.step,
      },
    })
  } catch (error) {
    console.error('Get draft error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const validated = projectDraftSchema.parse(body)

    const draft = await prisma.projectDraft.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        formData: validated.formData as any,
        step: validated.step || 1,
      },
    })

    if (draft.count === 0) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: { id },
      message: 'Draft updated',
    })
  } catch (error) {
    console.error('Update draft error:', error)
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const draft = await prisma.projectDraft.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (draft.count === 0) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Draft deleted' })
  } catch (error) {
    console.error('Delete draft error:', error)
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    )
  }
}
