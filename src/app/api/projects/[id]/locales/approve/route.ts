import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id, deletedAt: null } })
  if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  const { localeId, action, assetIds } = await req.json() as { localeId: string; action: 'approve' | 'reject'; assetIds?: string[] }

  if (action === 'approve') {
    if (assetIds?.length) {
      await prisma.localizedAsset.updateMany({ where: { id: { in: assetIds }, localeId }, data: { status: 'approved' } })
    } else {
      await prisma.localizedAsset.updateMany({ where: { localeId }, data: { status: 'approved' } })
      await prisma.projectLocale.update({ where: { id: localeId }, data: { status: 'approved' } })
    }
  } else if (action === 'reject') {
    await prisma.projectLocale.update({ where: { id: localeId }, data: { status: 'draft' } })
  }

  return NextResponse.json({ success: true })
}
