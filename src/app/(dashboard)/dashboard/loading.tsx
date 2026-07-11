import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div>
      {/* Header - Always visible */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-[-0.96px]">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="rounded-[var(--radius-pill)]">
            <Link href="/drafts">Drafts</Link>
          </Button>
          <Button asChild className="rounded-[var(--radius-pill)]">
            <Link href="/projects/new"><Plus size={16} className="mr-2" />New Project</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-[var(--shadow-sm)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-3.5 w-3.5 rounded-sm" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects Title */}
      <Skeleton className="h-5 w-32 mb-4" />

      {/* Search and Filters */}
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-10 flex-1 rounded-[var(--radius-sm)]" />
        <Skeleton className="h-10 w-32 rounded-[var(--radius-sm)]" />
        <Skeleton className="h-10 w-32 rounded-[var(--radius-sm)]" />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-3" />
              <div className="flex gap-1.5 mb-3 flex-wrap">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-40 mb-3" />
              <Skeleton className="h-9 w-full rounded-[var(--radius-sm)]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
