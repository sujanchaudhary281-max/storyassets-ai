import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const project = await prisma.project.findFirst({ where: { id, userId: session.user.id, deletedAt: null } })
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

    const { assetId } = await req.json()
    if (!assetId) return NextResponse.json({ success: false, error: 'assetId required' }, { status: 400 })

    const asset = await prisma.generatedAsset.findUnique({ where: { id: assetId } })
    if (!asset) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate 5 punchy alternative headlines for an app store screenshot. Return only a JSON array of 5 strings.' },
        { role: 'user', content: `Current headline: "${asset.captionHeadline}". App: ${project.name}. Description: ${project.description}` },
      ],
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(response.choices[0].message.content || '{"variants":[]}')
    const variants: string[] = parsed.variants || parsed.headlines || []

    return NextResponse.json({ success: true, data: { variants: variants.slice(0, 5) } })
  } catch (err) {
    console.error('Headlines error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
