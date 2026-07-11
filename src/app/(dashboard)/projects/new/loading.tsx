import { Skeleton } from '@/components/ui/skeleton'

export default function NewProjectLoading() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-2 w-12 rounded-full" />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto">
        <div className="border border-[var(--hairline)] rounded-[var(--radius-md)] p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full rounded-[var(--radius-sm)]" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-24 w-full rounded-[var(--radius-sm)]" />
            </div>
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-10 w-full rounded-[var(--radius-sm)]" />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}
