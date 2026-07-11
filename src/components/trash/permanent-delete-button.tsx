'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface PermanentDeleteButtonProps {
  projectId: string
  type: 'project' | 'asset'
}

export function PermanentDeleteButton({ projectId, type }: PermanentDeleteButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  async function handleDelete() {
    try {
      setDeleting(true)
      const endpoint = type === 'project' 
        ? `/api/projects/${projectId}/permanent` 
        : `/api/assets/${projectId}/permanent`
      
      const res = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete')
      }

      router.refresh()
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowDialog(true)}
        disabled={deleting}
        className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-[var(--radius-sm)]"
      >
        {deleting ? (
          <Loader2 size={14} className="mr-1 animate-spin" />
        ) : (
          <Trash2 size={14} className="mr-1" />
        )}
        Delete
      </Button>

      <ConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={`Permanently Delete ${type === 'project' ? 'Project' : 'Asset'}?`}
        description={`This ${type} will be permanently deleted and cannot be recovered. This action cannot be undone.`}
        confirmText="Delete Permanently"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
