import { Skeleton } from '@/components/ui/skeleton'

export default function TrashLoading() {
  return (
    <div>
      {/* Header - Always visible */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-[-0.96px]">Trash</h1>
        <p className="text-sm text-[var(--body)] mt-1">
          Items will be permanently deleted after 30 days
        </p>
      </div>

      {/* Deleted Projects Section */}
      <section className="mb-10">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 opacity-70">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-3" />
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-32 mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-[var(--radius-sm)]" />
                <Skeleton className="h-9 flex-1 rounded-[var(--radius-sm)]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deleted Assets Section */}
      <section className="mb-10">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 opacity-70">
              <Skeleton className="h-32 w-full mb-3 rounded-[var(--radius-sm)]" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-3 w-32 mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-[var(--radius-sm)]" />
                <Skeleton className="h-9 flex-1 rounded-[var(--radius-sm)]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
