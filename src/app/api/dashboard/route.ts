import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [projects, projectCount, jobCount, assetCount, user] = await Promise.all([
      prisma.project.findMany({
        where: { userId: session.user.id, deletedAt: null },
        include: { generationJobs: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.project.count({ where: { userId: session.user.id, deletedAt: null } }),
      prisma.generationJob.count({ where: { userId: session.user.id } }),
      prisma.generatedAsset.count({ where: { job: { userId: session.user.id } } }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { creditBalance: true } }),
    ])

    const stats = {
      projectCount,
      creditBalance: user?.creditBalance || 0,
      assetCount,
      jobCount,
    }

    return NextResponse.json({ data: { projects, stats } })
  } catch (error) {
    console.error('Fetch dashboard data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
