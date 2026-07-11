import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership and that it's deleted
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: { not: null },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found in trash' }, { status: 404 })
    }

    // Restore
    await prisma.project.update({
      where: { id },
      data: { deletedAt: null },
    })

    return NextResponse.json({ message: 'Project restored' })
  } catch (error) {
    console.error('Restore project error:', error)
    return NextResponse.json(
      { error: 'Failed to restore project' },
      { status: 500 }
    )
  }
}
