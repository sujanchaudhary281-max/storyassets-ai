import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: Request, { params }: { params: Promise<{ id: string; assetId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id, assetId } = await params

  const asset = await prisma.generatedAsset.findFirst({
    where: { id: assetId, job: { projectId: id, userId: session.user.id } },
    include: { job: { include: { project: true } } },
  })
  if (!asset) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 })

  const body = await req.json().catch(() => ({})) as { instruction?: string }
  const project = asset.job.project
  const { width, height } = asset

  // Save current as version
  await prisma.screenshotVersion.create({
    data: {
      assetId: asset.id,
      captionHeadline: asset.captionHeadline,
      captionSubtext: asset.captionSubtext,
      storageKey: asset.storageKey,
      width, height,
      fileSizeBytes: asset.fileSizeBytes,
      versionNote: 'Before regeneration',
    },
  })

  // Generate new caption via AI
  let headline = asset.captionHeadline ?? project.name
  let subtext = asset.captionSubtext ?? project.description

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-...')) {
    try {
      const { generateCaptions } = await import('@/lib/openai')
      const caption = await generateCaptions(
        project.name,
        body.instruction ? `${project.description}. Instruction: ${body.instruction}` : project.description,
        asset.index ?? 0,
        1
      )
      headline = caption.headline
      subtext = caption.subtext
    } catch { /* use existing */ }
  }

  // Re-composite with new captions
  const bgColor = project.brandColor ?? (project.stylePreset === 'dark' ? '#171717' : project.stylePreset === 'gradient' ? '#007cf0' : '#f5f5f5')
  const textColor = project.stylePreset === 'minimal' ? '#171717' : '#ffffff'
  const headlineSize = Math.round(width * 0.036)
  const subtextSize = Math.round(width * 0.023)

  function escapeXml(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }

  const svg = `<svg width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="${bgColor}"/>
    <text x="${width / 2}" y="${height * 0.08}" text-anchor="middle" font-family="sans-serif" font-size="${headlineSize}" font-weight="bold" fill="${textColor}">${escapeXml(headline)}</text>
    <text x="${width / 2}" y="${height * 0.12}" text-anchor="middle" font-family="sans-serif" font-size="${subtextSize}" fill="${textColor}" opacity="0.8">${escapeXml(subtext)}</text>
    <rect x="${width * 0.1}" y="${height * 0.18}" width="${width * 0.8}" height="${height * 0.75}" rx="24" fill="#00000020"/>
  </svg>`

  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  const dir = path.dirname(path.join(process.cwd(), 'public', asset.storageKey))
  await mkdir(dir, { recursive: true })
  const filename = `regen_${Date.now()}_${width}x${height}.png`
  await writeFile(path.join(dir, filename), buf)

  const newStorageKey = asset.storageKey.replace(/[^/]+$/, filename)
  await prisma.generatedAsset.update({
    where: { id: assetId },
    data: { storageKey: newStorageKey, captionHeadline: headline, captionSubtext: subtext, fileSizeBytes: buf.length },
  })

  return NextResponse.json({ success: true, data: { storageKey: newStorageKey, headline, subtext } })
}
