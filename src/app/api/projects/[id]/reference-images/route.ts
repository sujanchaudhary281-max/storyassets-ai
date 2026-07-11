import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

async function getProjectForUser(projectId: string, userId: string) {
  return prisma.project.findFirst({ where: { id: projectId, userId } })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const project = await getProjectForUser(id, session.user.id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const images = await prisma.referenceImage.findMany({ where: { projectId: id } })
  return NextResponse.json(images)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const project = await getProjectForUser(id, session.user.id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const rightsConfirmed = formData.get('rightsConfirmed') as string

  if (rightsConfirmed !== 'true') {
    return NextResponse.json({ error: 'You must confirm you have rights to use this image' }, { status: 400 })
  }

  const timestamp = Date.now()
  const originalFilename = file.name
  const storageKey = `generated/${id}/references/${timestamp}_${originalFilename}`
  const filePath = path.join(process.cwd(), 'public', storageKey)

  await mkdir(path.dirname(filePath), { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  const image = await prisma.referenceImage.create({
    data: { projectId: id, storageKey, originalFilename, rightsConfirmed: true },
  })

  return NextResponse.json(image, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const project = await getProjectForUser(id, session.user.id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { imageId } = await req.json()
  await prisma.referenceImage.delete({ where: { id: imageId, projectId: id } })

  return NextResponse.json({ success: true })
}
