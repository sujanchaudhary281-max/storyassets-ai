import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { screenshotUploadSchema } from '@/lib/validations'
import { getPresignedUploadUrl } from '@/lib/r2'
import { nanoid } from 'nanoid'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const project = await prisma.project.findFirst({ where: { id, userId: session.user.id, deletedAt: null } })
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = screenshotUploadSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })

    const ext = parsed.data.contentType === 'image/png' ? 'png' : 'jpg'
    const key = `uploads/${session.user.id}/${id}/screenshots/${nanoid()}.${ext}`
    const uploadUrl = await getPresignedUploadUrl(key, parsed.data.contentType)

    return NextResponse.json({ success: true, data: { uploadUrl, key } })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
