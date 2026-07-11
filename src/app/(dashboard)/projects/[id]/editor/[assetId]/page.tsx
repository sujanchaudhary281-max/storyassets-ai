import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ScreenshotEditor } from '@/components/generation/screenshot-editor'

export default async function EditorPage({ params }: { params: Promise<{ id: string; assetId: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')
  const { id, assetId } = await params

  const asset = await prisma.generatedAsset.findFirst({
    where: { id: assetId, job: { projectId: id, userId: session.user.id } },
    include: { job: { include: { project: true } } },
  })

  if (!asset) redirect('/dashboard')

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ScreenshotEditor asset={asset} projectId={id} />
    </div>
  )
}
