import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find the project to copy
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create a draft with the project data
    const draft = await prisma.projectDraft.create({
      data: {
        userId: session.user.id,
        formData: {
          name: `${project.name} (Copy)`,
          description: project.description,
          ageGroup: project.ageGroup || 'all-ages',
          category: project.category,
          platforms: project.platforms,
          stylePreset: project.stylePreset,
          brandColor: project.brandColor || '',
          templateId: project.templateId || undefined,
        },
        step: 1,
      },
    })

    return NextResponse.json({
      data: { draftId: draft.id },
      message: 'Project copied to draft',
    })
  } catch (error) {
    console.error('Copy project error:', error)
    return NextResponse.json(
      { error: 'Failed to copy project' },
      { status: 500 }
    )
  }
}
