import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { DEVICE_SIZES } from '@/lib/device-sizes'

export async function POST(req: Request, { params }: { params: Promise<{ id: string; assetId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id, assetId } = await params

  const asset = await prisma.generatedAsset.findFirst({
    where: { id: assetId, job: { projectId: id, userId: session.user.id } },
    include: { job: { include: { project: true, generatedAssets: true } } },
  })
  if (!asset) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 })

  const { headline, subtext, background } = await req.json() as {
    headline: { text: string; fontSize: number; color: string; y: number }
    subtext: { text: string; fontSize: number; color: string; y: number }
    background: { type: string; value: string; gradientEnd?: string }
  }

  // Find sibling assets (same index, same platform, different device sizes)
  const siblings = asset.job.generatedAssets.filter(
    a => a.index === asset.index && a.platform === asset.platform && a.id !== asset.id
  )

  function escapeXml(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }

  const updated: string[] = []

  for (const sibling of siblings) {
    const { width, height } = sibling
    // Proportional relayout: scale font sizes relative to target width vs source width
    const scale = width / asset.width
    const headlineSize = Math.round(headline.fontSize * scale)
    const subtextSize = Math.round(subtext.fontSize * scale)

    const svg = `<svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${background.value}"/>
      <text x="${width / 2}" y="${height * headline.y}" text-anchor="middle" font-family="sans-serif" font-size="${headlineSize}" font-weight="bold" fill="${headline.color}">${escapeXml(headline.text)}</text>
      <text x="${width / 2}" y="${height * subtext.y}" text-anchor="middle" font-family="sans-serif" font-size="${subtextSize}" fill="${subtext.color}" opacity="0.8">${escapeXml(subtext.text)}</text>
      <rect x="${width * 0.1}" y="${height * 0.18}" width="${width * 0.8}" height="${height * 0.75}" rx="24" fill="#00000020"/>
    </svg>`

    const buf = await sharp(Buffer.from(svg)).png().toBuffer()
    const dir = path.dirname(path.join(process.cwd(), 'public', sibling.storageKey))
    await mkdir(dir, { recursive: true })
    const filename = `applied_${Date.now()}_${width}x${height}.png`
    await writeFile(path.join(dir, filename), buf)

    const newStorageKey = sibling.storageKey.replace(/[^/]+$/, filename)

    // Save version before overwriting
    await prisma.screenshotVersion.create({
      data: {
        assetId: sibling.id,
        captionHeadline: sibling.captionHeadline,
        captionSubtext: sibling.captionSubtext,
        storageKey: sibling.storageKey,
        width, height,
        fileSizeBytes: sibling.fileSizeBytes,
        versionNote: 'Before apply-to-all',
      },
    })

    await prisma.generatedAsset.update({
      where: { id: sibling.id },
      data: { storageKey: newStorageKey, captionHeadline: headline.text, captionSubtext: subtext.text, fileSizeBytes: buf.length, parentAssetId: asset.id },
    })
    updated.push(sibling.id)
  }

  return NextResponse.json({ success: true, data: { updatedCount: updated.length, updatedIds: updated } })
}
