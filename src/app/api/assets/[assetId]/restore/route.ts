import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    // Restore
    await prisma.generatedAsset.update({
      where: { id: assetId },
      data: { deletedAt: null },
    })

    return NextResponse.json({ message: 'Asset restored' })
  } catch (error) {
    console.error('Restore asset error:', error)
    return NextResponse.json(
      { error: 'Failed to restore asset' },
      { status: 500 }
    )
  }
}
