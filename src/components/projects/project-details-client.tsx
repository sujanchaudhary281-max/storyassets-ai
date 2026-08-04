'use client'

import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ResultsDashboard } from '@/components/generation/results-dashboard'
import { CopyProjectButton } from '@/components/projects/copy-project-button'
import { GenerateButton } from '@/components/projects/generate-button'
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
  const activeJob = project.generationJobs.find(j => j.status === 'processing' || j.status === 'pending')
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

      {/* Live Generation Banner */}
      {activeJob && (
        <div className="p-4 rounded-xl border border-[var(--hairline)] bg-[var(--canvas-soft)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-[var(--link)]" />
            <div>
              <p className="text-sm font-medium">Generating screenshots in progress...</p>
              <p className="text-xs text-[var(--mute)]">Creating device mockups, headlines, and layouts...</p>
            </div>
          </div>
          <Link href={`/projects/${project.id}/generate?jobId=${activeJob.id}`}>
            <Button variant="outline" size="sm" className="rounded-[var(--radius-pill)]">
              View Live Generation
            </Button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.96px]">{project.name}</h1>
          <p className="text-sm text-[var(--body)] mt-1 line-clamp-2">{project.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <GenerateButton projectId={project.id} />
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
        ) : activeJob ? (
          <div className="p-8 text-center border border-dashed border-[var(--hairline)] rounded-xl">
            <Loader2 size={24} className="mx-auto mb-2 animate-spin text-[var(--link)]" />
            <p className="text-sm font-medium">Generating your app screenshots...</p>
            <p className="text-xs text-[var(--mute)] mt-1">Please wait a moment while we render your store assets.</p>
          </div>
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
