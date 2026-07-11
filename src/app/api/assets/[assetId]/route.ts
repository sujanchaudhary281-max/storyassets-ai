import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assetId } = await params

    // Verify ownership
    const asset = await prisma.generatedAsset.findFirst({
      where: {
        id: assetId,
      },
      include: {
        job: {
          include: {
            project: true,
          },
        },
      },
    })

    if (!asset || asset.job.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Soft delete
    await prisma.generatedAsset.update({
      where: { id: assetId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: 'Asset moved to trash' })
  } catch (error) {
    console.error('Delete asset error:', error)
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
