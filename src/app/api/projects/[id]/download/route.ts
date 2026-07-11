import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPublicUrl } from '@/lib/r2'
import sharp from 'sharp'

const archiver = require('archiver')

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params
    const searchParams = req.nextUrl.searchParams
    const format = searchParams.get('format') || 'zip'
    const assetIds = searchParams.get('assets')?.split(',') || []

    if (assetIds.length === 0) {
      return NextResponse.json({ error: 'No assets specified' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id, deletedAt: null },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get assets
    const assets = await prisma.generatedAsset.findMany({
      where: {
        id: { in: assetIds },
        deletedAt: null,
        job: {
          projectId,
        },
      },
    })

    if (assets.length === 0) {
      return NextResponse.json({ error: 'No assets found' }, { status: 404 })
    }

    // If format is zip, create archive
    if (format === 'zip') {
      const archive = archiver('zip', { zlib: { level: 9 } })
      
      // Create readable stream for response
      const stream = new ReadableStream({
        start(controller) {
          archive.on('data', (chunk: any) => controller.enqueue(chunk))
          archive.on('end', () => controller.close())
          archive.on('error', (err: any) => controller.error(err))
        },
      })

      // Add each asset to archive
      for (const asset of assets) {
        const url = getPublicUrl(asset.storageKey)
        const response = await fetch(url)
        const buffer = Buffer.from(await response.arrayBuffer())
        const filename = `${asset.platform}-${asset.deviceSize}-${asset.index || 0}.png`
        archive.append(buffer, { name: filename })
      }

      archive.finalize()

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="assets-${projectId}.zip"`,
        },
      })
    }

    // For single format (PNG/JPEG), download all as individual files in zip
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    const stream = new ReadableStream({
      start(controller) {
        archive.on('data', (chunk: any) => controller.enqueue(chunk))
        archive.on('end', () => controller.close())
        archive.on('error', (err: any) => controller.error(err))
      },
    })

    for (const asset of assets) {
      const url = getPublicUrl(asset.storageKey)
      const response = await fetch(url)
      let buffer: Buffer = Buffer.from(await response.arrayBuffer())

      // Convert to requested format if needed
      if (format === 'jpeg') {
        buffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer() as Buffer
      } else if (format === 'png') {
        buffer = await sharp(buffer).png().toBuffer() as Buffer
      }

      const filename = `${asset.platform}-${asset.deviceSize}-${asset.index || 0}.${format}`
      archive.append(buffer, { name: filename })
    }

    archive.finalize()

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="assets-${projectId}.zip"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download assets' },
      { status: 500 }
    )
  }
}
