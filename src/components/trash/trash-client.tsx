'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { RestoreProjectButton } from '@/components/trash/restore-project-button'
import { PermanentDeleteButton } from '@/components/trash/permanent-delete-button'
import { Trash2 } from 'lucide-react'
import { toast } from '@/lib/toast'

interface Project {
  id: string
  name: string
  description: string | null
  category: string
  platforms: string[]
  deletedAt: Date | null
}

interface Asset {
  id: string
  storageKey: string
  captionHeadline: string | null
  deletedAt: Date | null
  job: {
    project: {
      name: string
    }
  }
}

interface TrashClientProps {
  deletedProjects: Project[]
  deletedAssets: Asset[]
}

function getDaysRemaining(deletedAt: Date | null) {
  if (!deletedAt) return 30
  const now = new Date()
  const diff = now.getTime() - new Date(deletedAt).getTime()
  const daysElapsed = Math.floor(diff / (1000 * 60 * 60 * 24))
  return Math.max(0, 30 - daysElapsed)
}

export function TrashClient({ deletedProjects, deletedAssets }: TrashClientProps) {
  const [showDeleteAllProjectsDialog, setShowDeleteAllProjectsDialog] = useState(false)
  const [showDeleteAllAssetsDialog, setShowDeleteAllAssetsDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAllProjects() {
    try {
      setDeleting(true)
      
      await Promise.all(
        deletedProjects.map((project) =>
          fetch(`/api/projects/${project.id}/permanent`, {
            method: 'DELETE',
          })
        )
      )

      toast.success('All projects deleted', 'All deleted projects have been permanently removed.')
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Delete failed', 'Failed to delete all projects')
    } finally {
      setDeleting(false)
    }
  }

  async function handleDeleteAllAssets() {
    try {
      setDeleting(true)
      
      await Promise.all(
        deletedAssets.map((asset) =>
          fetch(`/api/assets/${asset.id}/permanent`, {
            method: 'DELETE',
          })
        )
      )

      toast.success('All assets deleted', 'All deleted assets have been permanently removed.')
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Delete failed', 'Failed to delete all assets')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-[-0.96px]">Trash</h1>
        <p className="text-sm text-[var(--body)] mt-1">
          Items will be permanently deleted after 30 days
        </p>
      </div>

      {/* Deleted Projects */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-[-0.6px]">Deleted Projects</h2>
          {deletedProjects.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteAllProjectsDialog(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-[var(--radius-pill)]"
            >
              <Trash2 size={14} className="mr-2" />
              Delete All
            </Button>
          )}
        </div>

        {deletedProjects.length === 0 ? (
          <p className="text-sm text-[var(--mute)]">No deleted projects</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deletedProjects.map((project) => {
              const daysRemaining = getDaysRemaining(project.deletedAt)
              
              return (
                <Card key={project.id} className="shadow-[var(--shadow-sm)] opacity-70">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium tracking-[-0.28px]">
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-[var(--body)] mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {project.category}
                      </Badge>
                      {project.platforms.map((p) => (
                        <Badge key={p} variant="outline" className="text-xs font-normal">
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-red-600 mb-3">
                      Deletes in {daysRemaining} days
                    </p>
                    <div className="flex gap-2">
                      <RestoreProjectButton projectId={project.id} />
                      <PermanentDeleteButton projectId={project.id} type="project" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Deleted Assets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-[-0.6px]">Deleted Assets</h2>
          {deletedAssets.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteAllAssetsDialog(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-[var(--radius-pill)]"
            >
              <Trash2 size={14} className="mr-2" />
              Delete All
            </Button>
          )}
        </div>

        {deletedAssets.length === 0 ? (
          <p className="text-sm text-[var(--mute)]">No deleted assets</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {deletedAssets.map((asset) => {
              const daysRemaining = getDaysRemaining(asset.deletedAt)
              const publicUrl = `/generated/${asset.storageKey}`
              
              return (
                <Card key={asset.id} className="shadow-[var(--shadow-sm)] opacity-70">
                  <CardContent className="p-2">
                    <div className="aspect-[9/16] bg-[var(--canvas-soft-2)] rounded mb-2">
                      <img
                        src={publicUrl}
                        alt={asset.captionHeadline || 'Screenshot'}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs font-medium truncate mb-1">
                      {asset.job.project.name}
                    </p>
                    <p className="text-[10px] text-red-600 mb-2">
                      Deletes in {daysRemaining}d
                    </p>
                    <div className="flex flex-col gap-1">
                      <RestoreProjectButton projectId={asset.id} type="asset" />
                      <PermanentDeleteButton projectId={asset.id} type="asset" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Delete All Projects Confirmation */}
      <ConfirmDialog
        open={showDeleteAllProjectsDialog}
        onOpenChange={setShowDeleteAllProjectsDialog}
        title="Delete All Projects?"
        description={`Are you sure you want to permanently delete all ${deletedProjects.length} project${deletedProjects.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
        onConfirm={handleDeleteAllProjects}
        loading={deleting}
      />

      {/* Delete All Assets Confirmation */}
      <ConfirmDialog
        open={showDeleteAllAssetsDialog}
        onOpenChange={setShowDeleteAllAssetsDialog}
        title="Delete All Assets?"
        description={`Are you sure you want to permanently delete all ${deletedAssets.length} asset${deletedAssets.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
        onConfirm={handleDeleteAllAssets}
        loading={deleting}
      />
    </div>
  )
}
