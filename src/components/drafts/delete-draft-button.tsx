'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteDraftButtonProps {
  draftId: string
}

export function DeleteDraftButton({ draftId }: DeleteDraftButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Delete this draft? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete draft')
      }

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete draft')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
    >
      {deleting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
    </Button>
  )
}
