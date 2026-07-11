import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteObject } from '@/lib/r2'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const project = await prisma.project.findFirst({ where: { id, userId: session.user.id, deletedAt: null } })
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const { key, filename, width, height, fileSize } = await req.json()
    const count = await prisma.uploadedScreenshot.count({ where: { projectId: id } })

    const screenshot = await prisma.uploadedScreenshot.create({
      data: { projectId: id, storageKey: key, originalFilename: filename, width, height, fileSizeBytes: fileSize, sortOrder: count },
    })

    return NextResponse.json({ success: true, data: screenshot }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const screenshotId = searchParams.get('screenshotId')
    if (!screenshotId) return NextResponse.json({ success: false, error: 'Missing screenshotId' }, { status: 400 })

    const screenshot = await prisma.uploadedScreenshot.findFirst({
      where: { id: screenshotId, projectId: id, project: { userId: session.user.id } },
    })
    if (!screenshot) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    await deleteObject(screenshot.storageKey)
    await prisma.uploadedScreenshot.delete({ where: { id: screenshotId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
