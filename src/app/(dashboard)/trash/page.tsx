import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { TrashClient } from '@/components/trash/trash-client'

export default async function TrashPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const deletedProjects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
      deletedAt: { not: null },
    },
    orderBy: { deletedAt: 'desc' },
  })

  const deletedAssets = await prisma.generatedAsset.findMany({
    where: {
      deletedAt: { not: null },
      job: {
        project: {
          userId: session.user.id,
        },
      },
    },
    include: {
      job: {
        include: {
          project: true,
        },
      },
    },
    orderBy: { deletedAt: 'desc' },
  })

  return <TrashClient deletedProjects={deletedProjects} deletedAssets={deletedAssets} />
}
