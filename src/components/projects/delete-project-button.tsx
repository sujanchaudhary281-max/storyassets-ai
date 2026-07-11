'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface DeleteProjectButtonProps {
  projectId: string
}

export function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  async function handleDelete() {
    try {
      setDeleting(true)
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete project')
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
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowDialog(true)
        }}
        disabled={deleting}
        className="h-7 text-xs hover:bg-red-50 hover:text-red-600"
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
        title="Move to Trash?"
        description="This project will be moved to trash. You can restore it within 30 days."
        confirmText="Move to Trash"
        variant="warning"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
