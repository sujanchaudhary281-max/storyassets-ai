import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const project = await prisma.project.findFirst({ where: { id, userId: session.user.id, deletedAt: null } })
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || user.creditBalance < 1) {
      return NextResponse.json({ success: false, error: 'Insufficient credits' }, { status: 402 })
    }

    const activeJob = await prisma.generationJob.findFirst({
      where: { projectId: id, status: { in: ['pending', 'processing'] } },
    })
    if (activeJob) {
      return NextResponse.json({ success: false, error: 'A generation is already in progress' }, { status: 409 })
    }

    const [job] = await prisma.$transaction([
      prisma.generationJob.create({ data: { projectId: id, userId: session.user.id, status: 'processing', startedAt: new Date() } }),
      prisma.user.update({ where: { id: session.user.id }, data: { creditBalance: { decrement: 1 } } }),
    ])

    // Force both platforms regardless of project settings
    processJob(job.id, id, { ...project, platforms: ['ios', 'android'] }).catch(err => {
      console.error('Generate-all failed:', err)
      prisma.generationJob.update({ where: { id: job.id }, data: { status: 'failed', errorMessage: err.message } })
    })

    return NextResponse.json({ success: true, data: { jobId: job.id } }, { status: 201 })
  } catch (err) {
    console.error('Generate-all error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processJob(jobId: string, projectId: string, project: any) {
  const { name: appName, description, platforms, stylePreset, brandColor } = project
  const { DEVICE_SIZES } = await import('@/lib/device-sizes')

  const screenshotCount = 3
  const bgColor = brandColor ?? (stylePreset === 'dark' ? '#171717' : stylePreset === 'gradient' ? '#007cf0' : stylePreset === 'vibrant' ? '#ff0080' : '#f5f5f5')
  const textColor = stylePreset === 'minimal' ? '#171717' : '#ffffff'

  const captions = Array.from({ length: screenshotCount }, (_, i) => ({
    headline: `${appName} Feature ${i + 1}`,
    subtext: description.slice(0, 80),
  }))

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-...')) {
    try {
      const { generateCaptions } = await import('@/lib/openai')
      for (let i = 0; i < screenshotCount; i++) {
        captions[i] = await generateCaptions(appName, description, i, screenshotCount)
      }
    } catch { /* use fallback captions */ }
  }

  const outputDir = path.join(process.cwd(), 'public', 'generated', jobId)

  for (const platform of platforms) {
    const sizes = DEVICE_SIZES[platform as keyof typeof DEVICE_SIZES]

    for (const [sizeKey, sizeInfo] of Object.entries(sizes)) {
      const { width, height } = sizeInfo as { width: number; height: number }
      const dir = path.join(outputDir, 'screenshots', platform, sizeKey)
      await mkdir(dir, { recursive: true })

      const headlineSize = Math.round(width * 0.036)
      const subtextSize = Math.round(width * 0.023)

      for (let i = 0; i < screenshotCount; i++) {
        const headline = captions[i].headline
        const subtext = captions[i].subtext

        const textSvg = `<svg width="${width}" height="${height}">
          <rect width="${width}" height="${height}" fill="${bgColor}"/>
          <text x="${width / 2}" y="${height * 0.08}" text-anchor="middle" font-family="sans-serif" font-size="${headlineSize}" font-weight="bold" fill="${textColor}">${escapeXml(headline)}</text>
          <text x="${width / 2}" y="${height * 0.12}" text-anchor="middle" font-family="sans-serif" font-size="${subtextSize}" fill="${textColor}" opacity="0.8">${escapeXml(subtext)}</text>
          <rect x="${width * 0.1}" y="${height * 0.18}" width="${width * 0.8}" height="${height * 0.75}" rx="24" fill="#00000020"/>
        </svg>`

        const buf = await sharp(Buffer.from(textSvg)).png().toBuffer()
        const filename = `${sizeKey}_screenshot_${String(i + 1).padStart(2, '0')}_${width}x${height}.png`
        await writeFile(path.join(dir, filename), buf)

        const storageKey = `/generated/${jobId}/screenshots/${platform}/${sizeKey}/${filename}`
        await prisma.generatedAsset.create({
          data: {
            jobId,
            assetType: platform === 'ios' ? 'screenshot_ios' : 'screenshot_android',
            platform,
            deviceSize: sizeKey,
            index: i,
            sortOrder: i,
            captionHeadline: headline,
            captionSubtext: subtext,
            storageKey,
            width,
            height,
            fileSizeBytes: buf.length,
          },
        })
      }
    }
  }

  await prisma.generationJob.update({
    where: { id: jobId },
    data: { status: 'completed', completedAt: new Date(), expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
  })
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
