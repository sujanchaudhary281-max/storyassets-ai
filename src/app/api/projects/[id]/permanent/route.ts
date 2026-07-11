import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Permanently delete (cascade will handle related records)
    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Project permanently deleted' })
  } catch (error) {
    console.error('Permanent delete project error:', error)
    return NextResponse.json(
      { error: 'Failed to permanently delete project' },
      { status: 500 }
    )
  }
}
