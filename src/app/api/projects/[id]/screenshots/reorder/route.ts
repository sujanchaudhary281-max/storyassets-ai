import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id, deletedAt: null } })
  if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

  const { assetIds } = await req.json() as { assetIds: string[] }
  if (!Array.isArray(assetIds)) return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })

  await prisma.$transaction(
    assetIds.map((id, i) => prisma.generatedAsset.update({ where: { id }, data: { sortOrder: i } }))
  )

  return NextResponse.json({ success: true })
}
