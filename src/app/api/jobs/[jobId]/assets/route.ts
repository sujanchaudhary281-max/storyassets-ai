import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { jobId } = await params

    const job = await prisma.generationJob.findFirst({ where: { id: jobId, userId: session.user.id } })
    if (!job) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const assets = await prisma.generatedAsset.findMany({ where: { jobId } })

    const useR2 = process.env.CLOUDFLARE_R2_ACCOUNT_ID && !process.env.CLOUDFLARE_R2_ACCOUNT_ID.includes('your-')

    const assetsWithUrls = await Promise.all(assets.map(async (asset) => {
      let url: string
      if (useR2) {
        const { getPresignedDownloadUrl } = await import('@/lib/r2')
        url = await getPresignedDownloadUrl(asset.storageKey)
      } else {
        // Serve from public folder
        url = asset.storageKey
      }
      return { ...asset, url }
    }))

    return NextResponse.json({ success: true, data: assetsWithUrls })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
