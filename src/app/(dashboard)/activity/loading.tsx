import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function ActivityLoading() {
  return (
    <div>
      {/* Header - Always visible */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-[-0.96px]">Activity</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <Skeleton className="h-10 flex-1 rounded-[var(--radius-sm)]" />
        <Skeleton className="h-10 w-32 rounded-[var(--radius-sm)]" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="shadow-[var(--shadow-sm)]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-2/3 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
