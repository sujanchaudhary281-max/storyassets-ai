import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id, deletedAt: null } })
  if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  const locales = await prisma.projectLocale.findMany({
    where: { projectId: id },
    include: { _count: { select: { localizedAssets: true } } },
  })

  return NextResponse.json({ success: true, data: { locales } })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id, deletedAt: null } })
  if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  const { locales } = await req.json() as { locales: string[] }

  const results = await prisma.$transaction(
    locales.map(code => prisma.projectLocale.upsert({
      where: { projectId_locale: { projectId: id, locale: code } },
      create: { projectId: id, locale: code },
      update: {},
    }))
  )

  const allLocales = await prisma.projectLocale.findMany({
    where: { projectId: id },
    include: { _count: { select: { localizedAssets: true } } },
  })

  return NextResponse.json({ success: true, data: { locales: allLocales } }, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id, deletedAt: null } })
  if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  const { localeId } = await req.json() as { localeId: string }
  await prisma.projectLocale.delete({ where: { id: localeId, projectId: id } })

  return NextResponse.json({ success: true })
}
