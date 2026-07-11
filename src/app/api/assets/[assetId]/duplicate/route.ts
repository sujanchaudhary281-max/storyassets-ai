import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPublicUrl, uploadBuffer } from '@/lib/r2'

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

    // Get the original asset
    const originalAsset = await prisma.generatedAsset.findFirst({
      where: {
        id: assetId,
        deletedAt: null,
      },
      include: {
        job: {
          include: {
            project: true,
          },
        },
      },
    })

    if (!originalAsset || originalAsset.job.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Fetch the original asset from R2
    const url = getPublicUrl(originalAsset.storageKey)
    const response = await fetch(url)
    const buffer = Buffer.from(await response.arrayBuffer())

    // Generate new storage key
    const timestamp = Date.now()
    const newKey = `${originalAsset.storageKey.split('/').slice(0, -1).join('/')}/duplicate-${timestamp}.png`

    // Upload duplicate to R2
    await uploadBuffer(newKey, buffer, 'image/png')

    // Create duplicate asset record
    const duplicate = await prisma.generatedAsset.create({
      data: {
        jobId: originalAsset.jobId,
        assetType: originalAsset.assetType,
        platform: originalAsset.platform,
        index: originalAsset.index,
        captionHeadline: `${originalAsset.captionHeadline} (Copy)`,
        captionSubtext: originalAsset.captionSubtext,
        storageKey: newKey,
        width: originalAsset.width,
        height: originalAsset.height,
        fileSizeBytes: originalAsset.fileSizeBytes,
        sortOrder: originalAsset.sortOrder + 0.5, // Place after original
        deviceSize: originalAsset.deviceSize,
        parentAssetId: originalAsset.id,
      },
    })

    return NextResponse.json({
      data: { id: duplicate.id },
      message: 'Asset duplicated successfully',
    })
  } catch (error) {
    console.error('Duplicate asset error:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate asset' },
      { status: 500 }
    )
  }
}
