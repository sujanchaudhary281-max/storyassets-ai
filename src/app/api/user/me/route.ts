import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, role: true, creditBalance: true, createdAt: true },
    })

    return NextResponse.json({ success: true, data: user })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { name, image, role } = await req.json()
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { ...(name !== undefined && { name }), ...(image !== undefined && { image }), ...(role !== undefined && { role }) },
      select: { id: true, name: true, email: true, image: true, role: true, creditBalance: true },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = session.user.id

    // Subscription has onDelete: Restrict — must be removed before deleting the user
    await prisma.subscription.deleteMany({ where: { userId } })

    // Deleting the user cascades to all other related models
    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete account' }, { status: 500 })
  }
}
