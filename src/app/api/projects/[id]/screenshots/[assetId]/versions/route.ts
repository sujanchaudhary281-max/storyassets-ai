import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; assetId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id, assetId } = await params

  const asset = await prisma.generatedAsset.findFirst({
    where: { id: assetId, job: { projectId: id, userId: session.user.id } },
  })
  if (!asset) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 })

  const versions = await prisma.screenshotVersion.findMany({
    where: { assetId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: { versions } })
}

// Revert to a specific version
export async function POST(req: Request, { params }: { params: Promise<{ id: string; assetId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id, assetId } = await params

  const asset = await prisma.generatedAsset.findFirst({
    where: { id: assetId, job: { projectId: id, userId: session.user.id } },
  })
  if (!asset) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 })

  const { versionId } = await req.json() as { versionId: string }
  const version = await prisma.screenshotVersion.findFirst({ where: { id: versionId, assetId } })
  if (!version) return NextResponse.json({ success: false, error: 'Version not found' }, { status: 404 })

  // Save current state as a new version before reverting
  await prisma.screenshotVersion.create({
    data: {
      assetId,
      captionHeadline: asset.captionHeadline,
      captionSubtext: asset.captionSubtext,
      storageKey: asset.storageKey,
      width: asset.width,
      height: asset.height,
      fileSizeBytes: asset.fileSizeBytes,
      versionNote: 'Before revert',
    },
  })

  // Revert asset to the selected version
  await prisma.generatedAsset.update({
    where: { id: assetId },
    data: {
      captionHeadline: version.captionHeadline,
      captionSubtext: version.captionSubtext,
      storageKey: version.storageKey,
      fileSizeBytes: version.fileSizeBytes,
    },
  })

  return NextResponse.json({ success: true })
}
