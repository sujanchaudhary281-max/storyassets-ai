'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Copy, Loader2 } from 'lucide-react'

interface CopyProjectButtonProps {
  projectId: string
}

export function CopyProjectButton({ projectId }: CopyProjectButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCopy() {
    try {
      setLoading(true)
      const res = await fetch(`/api/projects/${projectId}/copy`, {
        method: 'POST',
      })
      
      const json = await res.json()
      
      if (!res.ok) {
        throw new Error(json.error || 'Failed to copy project')
      }
      
      // Redirect to new project with pre-filled form
      router.push(`/projects/new?from=${json.data.draftId}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to copy project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      disabled={loading}
      className="rounded-[var(--radius-pill)]"
    >
      {loading ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : (
        <Copy size={16} className="mr-2" />
      )}
      Copy Project
    </Button>
  )
}
