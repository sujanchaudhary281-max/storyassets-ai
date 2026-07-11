import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteObject } from '@/lib/r2'

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
        deletedAt: { not: null },
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
      return NextResponse.json({ error: 'Asset not found in trash' }, { status: 404 })
    }

    // Delete from R2
    try {
      await deleteObject(asset.storageKey)
    } catch (err) {
      console.error('Failed to delete from R2:', err)
    }

    // Permanently delete from database
    await prisma.generatedAsset.delete({
      where: { id: assetId },
    })

    return NextResponse.json({ message: 'Asset permanently deleted' })
  } catch (error) {
    console.error('Permanent delete asset error:', error)
    return NextResponse.json(
      { error: 'Failed to permanently delete asset' },
      { status: 500 }
    )
  }
}
