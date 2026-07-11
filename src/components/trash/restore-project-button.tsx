'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RestoreProjectButtonProps {
  projectId: string
  type?: 'project' | 'asset'
}

export function RestoreProjectButton({ projectId, type = 'project' }: RestoreProjectButtonProps) {
  const router = useRouter()
  const [restoring, setRestoring] = useState(false)

  async function handleRestore() {
    try {
      setRestoring(true)
      const endpoint = type === 'project' 
        ? `/api/projects/${projectId}/restore` 
        : `/api/assets/${projectId}/restore`
      
      const res = await fetch(endpoint, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to restore')
      }

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to restore')
    } finally {
      setRestoring(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleRestore}
      disabled={restoring}
      className="flex-1 rounded-[var(--radius-sm)]"
    >
      {restoring ? (
        <Loader2 size={14} className="mr-1 animate-spin" />
      ) : (
        <RotateCcw size={14} className="mr-1" />
      )}
      Restore
    </Button>
  )
}
