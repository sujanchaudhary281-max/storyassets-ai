import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DraftsLoading() {
  return (
    <div>
      {/* Header - Always visible */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-[-0.96px]">Drafts</h1>
        <p className="text-sm text-[var(--body)] mt-1">Continue working on your saved drafts</p>
      </div>

      {/* Drafts Grid Skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-3" />
              <Skeleton className="h-3 w-32 mb-3" />
              <Skeleton className="h-9 w-full rounded-[var(--radius-sm)]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
