import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-6" />

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <div className="border border-[var(--hairline)] rounded-[var(--radius-md)] p-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full rounded-[var(--radius-sm)]" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full rounded-[var(--radius-sm)]" />
            </div>
            <Skeleton className="h-10 w-24 rounded-[var(--radius-sm)]" />
          </div>
        </div>

        {/* Account Section */}
        <div className="border border-[var(--hairline)] rounded-[var(--radius-md)] p-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full rounded-[var(--radius-sm)]" />
            </div>
            <Skeleton className="h-10 w-32 rounded-[var(--radius-sm)]" />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-200 rounded-[var(--radius-md)] p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-10 w-32 rounded-[var(--radius-sm)]" />
        </div>
      </div>
    </div>
  )
}
