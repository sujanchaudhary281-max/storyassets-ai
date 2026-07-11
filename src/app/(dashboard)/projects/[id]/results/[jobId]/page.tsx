import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ResultsDashboard } from '@/components/generation/results-dashboard'

export default async function ResultsPage({ params }: { params: Promise<{ id: string; jobId: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')
  const { id, jobId } = await params

  const job = await prisma.generationJob.findFirst({
    where: { id: jobId, projectId: id, userId: session.user.id },
    include: {
      generatedAssets: {
        orderBy: { sortOrder: 'asc' },
        include: { localizedAssets: { include: { locale: true } } },
      },
      project: { include: { locales: true } },
    },
  })

  if (!job) redirect('/dashboard')

  const locales = job.project.locales.map(l => ({ code: l.locale, id: l.id }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.96px]">{job.project.name}</h1>
          <p className="text-sm text-[var(--mute)] mt-1">Generated {new Date(job.completedAt ?? job.createdAt).toLocaleDateString()}</p>
        </div>
        <a href={`/api/jobs/${jobId}/download`} className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] bg-[var(--ink)] text-[var(--on-primary)] text-sm font-medium hover:opacity-90 transition-opacity">
          Download All
        </a>
      </div>
      <ResultsDashboard assets={job.generatedAssets} jobId={jobId} projectId={id} projectName={job.project.name} locales={locales} />
    </div>
  )
}
