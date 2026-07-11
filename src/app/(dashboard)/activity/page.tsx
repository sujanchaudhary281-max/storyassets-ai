'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface Activity {
  id: string
  action: string
  projectId: string | null
  metadata: any
  createdAt: string
  project?: {
    name: string
  }
}

const ACTION_LABELS: Record<string, string> = {
  project_created: 'Created Project',
  project_updated: 'Updated Project',
  project_deleted: 'Deleted Project',
  assets_generated: 'Generated Assets',
  asset_downloaded: 'Downloaded Asset',
  asset_duplicated: 'Duplicated Asset',
  asset_deleted: 'Deleted Asset',
  draft_saved: 'Saved Draft',
}

function ActivitySkeleton() {
  return (
    <div>
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

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    try {
      const res = await fetch('/api/activity')
      const json = await res.json()
      if (json.data) {
        setActivities(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchQuery ||
      (activity.project?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       activity.action.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesAction = actionFilter === 'all' || activity.action === actionFilter
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.createdAt)
      const now = new Date()
      
      if (dateFilter === 'today') {
        matchesDate = activityDate.toDateString() === now.toDateString()
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        matchesDate = activityDate >= weekAgo
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        matchesDate = activityDate >= monthAgo
      }
    }
    
    return matchesSearch && matchesAction && matchesDate
  })

  const actionTypes = Array.from(new Set(activities.map(a => a.action)))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-[-0.96px]">Activity History</h1>
        <p className="text-sm text-[var(--body)] mt-1">View all your actions and changes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mute)]" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-[var(--radius-sm)]"
          />
        </div>
        
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--canvas)] text-sm"
        >
          <option value="all">All Actions</option>
          {actionTypes.map(action => (
            <option key={action} value={action}>
              {ACTION_LABELS[action] || action}
            </option>
          ))}
        </select>
        
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--canvas)] text-sm"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Active Filters */}
      {(searchQuery || actionFilter !== 'all' || dateFilter !== 'all') && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-[var(--mute)]">Filters:</span>
          {searchQuery && <Badge variant="secondary">Search: "{searchQuery}"</Badge>}
          {actionFilter !== 'all' && <Badge variant="secondary">{ACTION_LABELS[actionFilter]}</Badge>}
          {dateFilter !== 'all' && <Badge variant="secondary">{dateFilter}</Badge>}
          <button
            onClick={() => {
              setSearchQuery('')
              setActionFilter('all')
              setDateFilter('all')
            }}
            className="text-xs text-[var(--link)] hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="text-sm text-[var(--mute)] mb-4">
        Showing {filteredActivities.length} of {activities.length} activities
      </div>

      {/* Activities List */}
      {loading ? (
        <ActivitySkeleton />
      ) : filteredActivities.length === 0 ? (
        <Card className="shadow-[var(--shadow-sm)] text-center py-12">
          <CardContent>
            <p className="text-sm text-[var(--mute)]">No activities found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {ACTION_LABELS[activity.action] || activity.action}
                      </Badge>
                      {activity.project && (
                        <span className="text-sm font-medium">{activity.project.name}</span>
                      )}
                    </div>
                    
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <p className="text-xs text-[var(--mute)] mt-1">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-[var(--mute)]">
                    <Calendar size={12} />
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
