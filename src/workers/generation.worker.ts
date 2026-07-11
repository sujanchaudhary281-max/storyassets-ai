import { Worker, Job } from 'bullmq'
import { createRedisConnection } from '../lib/redis'
import { prisma } from '../lib/prisma'
import { generateCaptions } from '../lib/openai'
import { uploadBuffer, getPublicUrl } from '../lib/r2'
import { sendJobCompleteEmail, sendLowCreditEmail } from '../lib/resend'
import sharp from 'sharp'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const archiver = require('archiver')
import { Writable } from 'stream'

interface JobPayload {
  jobId: string
  projectId: string
  userId: string
}

async function processGenerationJob(job: Job<JobPayload>) {
  const { jobId, projectId, userId } = job.data

  await prisma.generationJob.update({ where: { id: jobId }, data: { status: 'processing', startedAt: new Date() } })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { uploadedScreenshots: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!project) throw new Error('Project not found')

  const { name: appName, description, platforms, stylePreset, brandColor } = project

  // Step C: Generate Screenshot Captions
  const screenshotCount = Math.min(project.uploadedScreenshots.length || 3, 5)
  const captions: { headline: string; subtext: string }[] = []
  for (let i = 0; i < screenshotCount; i++) {
    const caption = await generateCaptions(appName, description, i, screenshotCount)
    captions.push(caption)
  }

  // Step D: Composite Screenshots
  const bgColor = brandColor ?? (stylePreset === 'dark' ? '#171717' : stylePreset === 'gradient' ? '#007cf0' : stylePreset === 'vibrant' ? '#ff0080' : '#f5f5f5')

  for (const platform of platforms) {
    const width = platform === 'ios' ? 1242 : 1080
    const height = platform === 'ios' ? 2688 : 1920

    for (let i = 0; i < screenshotCount; i++) {
      // Create background canvas
      const canvas = sharp({ create: { width, height, channels: 4, background: bgColor } }).png()

      // Create text overlay SVG
      const headline = captions[i]?.headline ?? appName
      const subtext = captions[i]?.subtext ?? description
      const textSvg = `<svg width="${width}" height="${height}">
        <text x="${width / 2}" y="${height * 0.08}" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="bold" fill="white">${escapeXml(headline)}</text>
        <text x="${width / 2}" y="${height * 0.12}" text-anchor="middle" font-family="sans-serif" font-size="30" fill="white" opacity="0.8">${escapeXml(subtext)}</text>
        <rect x="${width * 0.1}" y="${height * 0.18}" width="${width * 0.8}" height="${height * 0.75}" rx="24" fill="#00000030"/>
      </svg>`

      const composited = await canvas.composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }]).toBuffer()

      const key = `jobs/${jobId}/screenshots/${platform}/${platform}_screenshot_${String(i + 1).padStart(2, '0')}_${width}x${height}.png`
      await uploadBuffer(key, composited, 'image/png')
      await prisma.generatedAsset.create({
        data: { jobId, assetType: platform === 'ios' ? 'screenshot_ios' : 'screenshot_android', platform, index: i, captionHeadline: headline, captionSubtext: subtext, storageKey: key, width, height, fileSizeBytes: composited.length },
      })
    }
  }

  // Step E: Bundle ZIP
  const zipBuffer = await createZipBundle(jobId, project.name)
  const zipKey = `jobs/${jobId}/storeassets_ai_${project.name.replace(/\s+/g, '_').toLowerCase()}.zip`
  await uploadBuffer(zipKey, zipBuffer, 'application/zip')

  // Finalize
  await prisma.generationJob.update({
    where: { id: jobId },
    data: { status: 'completed', completedAt: new Date(), assetsZipUrl: zipKey, expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
  })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user) {
    await sendJobCompleteEmail(user.email, project.name, jobId).catch(() => {})
    if (user.creditBalance <= 2) await sendLowCreditEmail(user.email, user.creditBalance).catch(() => {})
  }
}

async function createZipBundle(jobId: string, projectName: string): Promise<Buffer> {
  const assets = await prisma.generatedAsset.findMany({ where: { jobId } })

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const writable = new Writable({ write(chunk, _enc, cb) { chunks.push(chunk); cb() } })
    const archive = archiver('zip', { zlib: { level: 5 } })

    writable.on('finish', () => resolve(Buffer.concat(chunks)))
    archive.on('error', reject)
    archive.pipe(writable)

    // Add a README
    archive.append(`StoreAssets AI - ${projectName}\n\nGenerated assets for your app store listings.\nUpload each file to the corresponding platform.\n`, { name: 'README.txt' })

    archive.finalize()
  })
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Start the worker
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const worker = new Worker<JobPayload>('generation-queue', processGenerationJob, {
  connection: createRedisConnection() as any,
  concurrency: 2,
})

worker.on('completed', (job) => console.log(`[Worker] Job ${job.id} completed`))
worker.on('failed', async (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message)
  if (job) {
    await prisma.generationJob.update({ where: { id: job.data.jobId }, data: { status: 'failed', errorMessage: err.message } })
  }
})

console.log('[Worker] Generation worker started, listening for jobs...')
