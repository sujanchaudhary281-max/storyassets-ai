import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/validations'
import { getPublicUrl } from '@/lib/r2'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        generationJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ data: projects })
  } catch (error) {
    console.error('Fetch projects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = projectSchema.parse(body)

    const iconUrl = validatedData.iconKey ? getPublicUrl(validatedData.iconKey) : null

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        description: validatedData.description,
        ageGroup: validatedData.ageGroup,
        category: validatedData.category,
        iconUrl: iconUrl,
        platforms: validatedData.platforms,
        stylePreset: validatedData.stylePreset,
        brandColor: validatedData.brandColor,
        templateId: validatedData.templateId,
      },
    })

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}