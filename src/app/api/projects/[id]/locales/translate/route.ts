import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { SUPPORTED_LOCALES } from '@/lib/locales'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { localeId } = await req.json() as { localeId: string }

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id, deletedAt: null } })
  if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

  const projectLocale = await prisma.projectLocale.findFirst({ where: { id: localeId, projectId: id } })
  if (!projectLocale) return NextResponse.json({ success: false, error: 'Locale not found' }, { status: 404 })

  const latestJob = await prisma.generationJob.findFirst({
    where: { projectId: id, status: 'completed' },
    orderBy: { completedAt: 'desc' },
  })
  if (!latestJob) return NextResponse.json({ success: false, error: 'No completed generation' }, { status: 404 })

  const assets = await prisma.generatedAsset.findMany({ where: { jobId: latestJob.id } })
  const localeName = SUPPORTED_LOCALES.find(l => l.code === projectLocale.locale)?.name ?? projectLocale.locale

  for (const asset of assets) {
    if (!asset.captionHeadline || !asset.captionSubtext) continue

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `You are a professional app store translator. Translate the following App Store screenshot captions to ${localeName}. Keep translations punchy and within similar character count. Output JSON: {"headline": "...", "subtext": "..."}` },
          { role: 'user', content: JSON.stringify({ headline: asset.captionHeadline, subtext: asset.captionSubtext }) },
        ],
      })

      const translated = JSON.parse(res.choices[0].message.content ?? '{}')
      const headline = translated.headline ?? asset.captionHeadline
      const subtext = translated.subtext ?? asset.captionSubtext
      const overflowDetected = headline.length > asset.captionHeadline.length * 1.3
      const suggestedFontSize = overflowDetected ? Math.round(36 * (asset.captionHeadline.length / headline.length)) : null

      await prisma.localizedAsset.upsert({
        where: { localeId_assetId: { localeId, assetId: asset.id } },
        create: { localeId, assetId: asset.id, captionHeadline: headline, captionSubtext: subtext, overflowDetected, suggestedFontSize, status: 'pending' },
        update: { captionHeadline: headline, captionSubtext: subtext, overflowDetected, suggestedFontSize, status: 'pending' },
      })
    } catch { /* skip failed translations */ }
  }

  await prisma.projectLocale.update({ where: { id: localeId }, data: { status: 'translated' } })
  return NextResponse.json({ success: true })
}
