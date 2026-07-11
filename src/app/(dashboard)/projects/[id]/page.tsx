import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProjectDetailsClient } from '@/components/projects/project-details-client'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')
  const { id } = await params

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      generationJobs: { orderBy: { createdAt: 'desc' }, take: 10, include: { generatedAssets: { include: { localizedAssets: { include: { locale: true } } } } } },
      locales: { include: { _count: { select: { localizedAssets: true } } } },
    },
  })

  if (!project) redirect('/dashboard')

  return <ProjectDetailsClient project={project} />
}
