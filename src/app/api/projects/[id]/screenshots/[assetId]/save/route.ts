import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: Request, { params }: { params: Promise<{ id: string; assetId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id, assetId } = await params

  const asset = await prisma.generatedAsset.findFirst({
    where: { id: assetId, job: { projectId: id, userId: session.user.id } },
  })
  if (!asset) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 })

  // Save current version to history before overwriting
  await prisma.screenshotVersion.create({
    data: {
      assetId: asset.id,
      captionHeadline: asset.captionHeadline,
      captionSubtext: asset.captionSubtext,
      storageKey: asset.storageKey,
      width: asset.width,
      height: asset.height,
      fileSizeBytes: asset.fileSizeBytes,
      versionNote: 'Auto-saved before edit',
    },
  })

  // Write new file
  const buffer = Buffer.from(await file.arrayBuffer())
  const dir = path.dirname(path.join(process.cwd(), 'public', asset.storageKey))
  await mkdir(dir, { recursive: true })
  const filename = `edited_${Date.now()}_${asset.width}x${asset.height}.png`
  const filePath = path.join(dir, filename)
  await writeFile(filePath, buffer)

  const newStorageKey = asset.storageKey.replace(/[^/]+$/, filename)
  const headline = formData.get('headline') as string | null
  const subtext = formData.get('subtext') as string | null

  await prisma.generatedAsset.update({
    where: { id: assetId },
    data: {
      storageKey: newStorageKey,
      fileSizeBytes: buffer.length,
      ...(headline !== null && { captionHeadline: headline }),
      ...(subtext !== null && { captionSubtext: subtext }),
    },
  })

  return NextResponse.json({ success: true, data: { storageKey: newStorageKey } })
}
