'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, FolderOpen, Zap, Image, Calendar, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'
import { APP_CATEGORIES } from '@/lib/validations'

interface Project {
  id: string
  name: string
  description: string
  category: string
  platforms: string[]
  updatedAt: Date
  generationJobs: { createdAt: Date }[]
}

interface DashboardStats {
  projectCount: number
  creditBalance: number
  assetCount: number
  jobCount: number
}

function DashboardSkeleton() {
  return (
    <div>
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

      <Skeleton className="h-5 w-32 mb-4" />

      <div className="flex gap-3 mb-6">
        <Skeleton className="h-10 flex-1 rounded-[var(--radius-sm)]" />
        <Skeleton className="h-10 w-32 rounded-[var(--radius-sm)]" />
        <Skeleton className="h-10 w-32 rounded-[var(--radius-sm)]" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-48" />
      </div>

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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, router])

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      if (json.data) {
        setProjects(json.data.projects)
        setStats(json.data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter
    const matchesPlatform = platformFilter === 'all' || project.platforms.includes(platformFilter)

    return matchesSearch && matchesCategory && matchesPlatform
  })

  if (loading || !stats) {
    return (
      <div>
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
        <DashboardSkeleton />
      </div>
    )
  }

  const statsData = [
    { label: 'Total Projects', value: stats.projectCount, icon: FolderOpen },
    { label: 'Credits Remaining', value: stats.creditBalance, icon: Zap },
    { label: 'Assets Generated', value: stats.assetCount, icon: Image },
    { label: 'Total Jobs', value: stats.jobCount, icon: Calendar },
  ]

  return (
    <div>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="shadow-[var(--shadow-sm)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className="text-[var(--mute)]" />
                <p className="text-xs text-[var(--mute)] font-mono">{label}</p>
              </div>
              <p className="text-2xl font-semibold tracking-[-0.96px]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 ? (
        <Card className="shadow-[var(--shadow-md)] text-center py-16">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-[var(--canvas-soft-2)] mx-auto mb-4 flex items-center justify-center">
              <Image size={24} className="text-[var(--mute)]" />
            </div>
            <h2 className="text-lg font-semibold tracking-[-0.6px] mb-2">Your first app asset is 90 seconds away.</h2>
            <p className="text-sm text-[var(--body)] mb-6">Describe your app, and AI generates everything you need for the stores.</p>
            <Button asChild className="rounded-[var(--radius-pill)]">
              <Link href="/projects/new">Create your first project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h2 className="text-base font-medium mb-4">Recent Projects</h2>

          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mute)]" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-[var(--radius-sm)]"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--canvas)] text-sm"
            >
              <option value="all">All Categories</option>
              {APP_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--canvas)] text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </div>

          {(searchQuery || categoryFilter !== 'all' || platformFilter !== 'all') && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-[var(--mute)]">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {categoryFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {categoryFilter.replace(/-/g, ' ')}
                </Badge>
              )}
              {platformFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {platformFilter.toUpperCase()}
                </Badge>
              )}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('all')
                  setPlatformFilter('all')
                }}
                className="text-xs text-[var(--link)] hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[var(--mute)]">
                No projects match your filters. <button onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setPlatformFilter('all') }} className="text-[var(--link)] hover:underline">Clear filters</button>
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[var(--mute)]">
                  Showing {filteredProjects.length} of {projects.length} projects
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base font-medium tracking-[-0.28px] flex-1">{project.name}</CardTitle>
                        <DeleteProjectButton projectId={project.id} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-[var(--body)] mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex gap-1.5 mb-3 flex-wrap">
                        <Badge variant="secondary" className="text-xs font-normal">{project.category}</Badge>
                        {project.platforms.map(p => <Badge key={p} variant="outline" className="text-xs font-normal">{p}</Badge>)}
                      </div>
                      <p className="text-xs text-[var(--mute)] mb-3">
                        {project.generationJobs[0]
                          ? `Last generated ${new Date(project.generationJobs[0].createdAt).toLocaleDateString()}`
                          : 'Never generated'}
                      </p>
                      <Button asChild variant="outline" size="sm" className="rounded-[var(--radius-sm)] w-full">
                        <Link href={`/projects/${project.id}`}>Open</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
