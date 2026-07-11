import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { LocaleReview } from '@/components/projects/locale-review'

export default async function LocaleReviewPage({ params }: { params: Promise<{ id: string; localeId: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')
  const { id, localeId } = await params

  const projectLocale = await prisma.projectLocale.findFirst({
    where: { id: localeId, projectId: id, project: { userId: session.user.id } },
    include: { localizedAssets: { include: { asset: true } } },
  })

  if (!projectLocale) redirect(`/projects/${id}`)

  return (
    <div>
      <LocaleReview
        projectId={id}
        localeId={localeId}
        locale={projectLocale.locale}
        localizedAssets={projectLocale.localizedAssets}
        status={projectLocale.status}
      />
    </div>
  )
}
