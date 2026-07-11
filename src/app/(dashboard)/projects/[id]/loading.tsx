import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProjectLoading() {
  return (
    <div>
      {/* Back Button - Always visible */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm text-[var(--body)] hover:text-[var(--ink)] transition-colors mb-10"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-[var(--radius-sm)]" />
          <Skeleton className="h-10 w-32 rounded-[var(--radius-sm)]" />
        </div>
      </div>

      {/* Project Info */}
      <div className="flex gap-3 mb-10">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      {/* Screenshots Section */}
      <div className="mb-10">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1 rounded-[var(--radius-sm)]" />
                  <Skeleton className="h-8 w-8 rounded-[var(--radius-sm)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Assets Section */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1 rounded-[var(--radius-sm)]" />
                  <Skeleton className="h-8 w-8 rounded-[var(--radius-sm)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
