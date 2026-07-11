import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'
import { Writable } from 'stream'
import { validateExportAssets } from '@/lib/export-validator'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const archiver = require('archiver')

export async function GET(_req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { jobId } = await params

    const job = await prisma.generationJob.findFirst({
      where: { id: jobId, userId: session.user.id, status: 'completed' },
      include: { generatedAssets: true, project: { select: { name: true } } },
    })
    if (!job || job.generatedAssets.length === 0) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Validate dimensions
    const validation = validateExportAssets(job.generatedAssets)
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: 'Dimension mismatch', data: validation.errors }, { status: 422 })
    }

    // Fetch approved localized assets
    const localizedAssets = await prisma.localizedAsset.findMany({
      where: { asset: { jobId }, status: 'approved' },
      include: { locale: true, asset: true },
    })

    const chunks: Buffer[] = []
    const writable = new Writable({ write(chunk, _enc, cb) { chunks.push(chunk); cb() } })
    const archive = archiver('zip', { zlib: { level: 5 } })
    archive.pipe(writable)

    for (const asset of job.generatedAssets) {
      const platform = asset.platform ?? 'ios'
      const deviceSize = asset.deviceSize ?? 'phone'
      const filePath = path.join(process.cwd(), 'public', asset.storageKey)
      try {
        const buf = await readFile(filePath)
        archive.append(buf, { name: `${platform}/${deviceSize}/en-US/screenshot_${(asset.index ?? 0) + 1}.png` })

        // Add localized versions
        const assetLocalized = localizedAssets.filter(la => la.assetId === asset.id)
        for (const la of assetLocalized) {
          archive.append(buf, { name: `${platform}/${deviceSize}/${la.locale.locale}/screenshot_${(asset.index ?? 0) + 1}.png` })
        }
      } catch { /* skip missing files */ }
    }

    await archive.finalize()
    await new Promise<void>(resolve => writable.on('finish', resolve))

    const zipBuffer = Buffer.concat(chunks)
    const filename = `storeassets_${job.project.name.replace(/\s+/g, '_').toLowerCase()}.zip`

    return new NextResponse(zipBuffer, {
      headers: { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${filename}"` },
    })
  } catch (err) {
    console.error('Download error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
