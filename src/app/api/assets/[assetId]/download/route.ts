import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPublicUrl } from '@/lib/r2'
import sharp from 'sharp'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assetId } = await params
    const searchParams = req.nextUrl.searchParams
    const format = (searchParams.get('format') || 'png') as 'png' | 'jpeg'

    // Get asset and verify ownership
    const asset = await prisma.generatedAsset.findFirst({
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

    if (!asset || asset.job.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Fetch the asset from R2
    const url = getPublicUrl(asset.storageKey)
    const response = await fetch(url)
    let buffer: Buffer = Buffer.from(await response.arrayBuffer())

    // Convert to requested format
    let contentType = 'image/png'
    if (format === 'jpeg') {
      buffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer() as Buffer
      contentType = 'image/jpeg'
    } else {
      buffer = await sharp(buffer).png().toBuffer() as Buffer
    }

    const filename = `${asset.platform}-${asset.deviceSize}-${asset.index || 0}.${format}`

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Download asset error:', error)
    return NextResponse.json(
      { error: 'Failed to download asset' },
      { status: 500 }
    )
  }
}
