import { Skeleton } from '@/components/ui/skeleton'

export default function BillingLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-6" />
      <Skeleton className="h-40 rounded-[var(--radius-md)] mb-6" />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-[var(--radius-md)]" />
        <Skeleton className="h-64 rounded-[var(--radius-md)]" />
      </div>
    </div>
  )
}
