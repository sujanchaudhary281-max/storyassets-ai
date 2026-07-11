'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ResultsDashboard } from '@/components/generation/results-dashboard'
import { CopyProjectButton } from '@/components/projects/copy-project-button'
import { GeneratedAssets } from '@/components/generation/generated-assets'
import type { GeneratedAsset, LocalizedAsset, ProjectLocale, GenerationJob } from '@prisma/client'

type AssetWithLocalized = GeneratedAsset & {
  localizedAssets?: (LocalizedAsset & { locale: ProjectLocale })[]
}

type JobWithAssets = GenerationJob & {
  generatedAssets: AssetWithLocalized[]
}

interface ProjectDetailsClientProps {
  project: {
    id: string
    name: string
    description: string | null
    category: string
    platforms: string[]
    stylePreset: string
    brandColor: string | null
    generationJobs: JobWithAssets[]
    locales: (ProjectLocale & { _count: { localizedAssets: number } })[]
  }
}

export function ProjectDetailsClient({ project }: ProjectDetailsClientProps) {
  const latestJob = project.generationJobs.find(j => j.status === 'completed')

  return (
    <div className="space-y-10">
      {/* Back Button */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm text-[var(--body)] hover:text-[var(--ink)] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.96px]">{project.name}</h1>
          <p className="text-sm text-[var(--body)] mt-1 line-clamp-2">{project.description}</p>
        </div>
        <div>
          <CopyProjectButton projectId={project.id} />
        </div>
      </div>

      {/* Project Info */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="px-3 py-1 rounded-full bg-[var(--canvas-soft)] border border-[var(--hairline)]">{project.category}</span>
        {project.platforms.map(p => (
          <span key={p} className="px-3 py-1 rounded-full bg-[var(--canvas-soft)] border border-[var(--hairline)]">{p === 'ios' ? 'iOS' : 'Android'}</span>
        ))}
        <span className="px-3 py-1 rounded-full bg-[var(--canvas-soft)] border border-[var(--hairline)]">{project.stylePreset}</span>
        {project.brandColor && (
          <span className="px-3 py-1 rounded-full bg-[var(--canvas-soft)] border border-[var(--hairline)] flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: project.brandColor }} />{project.brandColor}
          </span>
        )}
      </div>

      {/* Screenshots */}
      <section>
        <h2 className="text-lg font-semibold tracking-[-0.6px] mb-4">Screenshots</h2>
        {latestJob ? (
          <ResultsDashboard
            assets={latestJob.generatedAssets}
            jobId={latestJob.id}
            projectId={project.id}
            projectName={project.name}
            locales={project.locales.map(l => ({ code: l.locale, id: l.id }))}
          />
        ) : (
          <p className="text-sm text-[var(--mute)]">No screenshots generated yet.</p>
        )}
      </section>

      {/* Generated Assets */}
      <section>
        <h2 className="text-lg font-semibold tracking-[-0.6px] mb-4">Generated Assets</h2>
        <GeneratedAssets
          assets={latestJob?.generatedAssets.filter(a => !a.deletedAt) || []}
          projectId={project.id}
        />
      </section>
    </div>
  )
}
