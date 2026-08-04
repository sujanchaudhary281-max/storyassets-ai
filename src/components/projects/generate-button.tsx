'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, Coins } from 'lucide-react'
import { toast } from '@/lib/toast'

export function GenerateButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userCredits, setUserCredits] = useState<number | null>(null)

  useEffect(() => {
    // Fetch user's current credits
    fetch('/api/user/credits')
      .then(r => r.json())
      .then(json => {
        if (json.data?.credits !== undefined) {
          setUserCredits(json.data.credits)
        }
      })
      .catch(err => console.error('Failed to fetch credits:', err))
  }, [])

  async function handleGenerate() {
    if (userCredits !== null && userCredits < 1) {
      toast.error('Insufficient credits', 'Please purchase more credits to continue.')
      return
    }

    setLoading(true)
    toast.info('Starting generation...', 'Redirecting to live progress screen...')
    
    try {
      const res = await fetch(`/api/projects/${projectId}/generate`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      const jobId = json.data.jobId
      router.push(`/projects/${projectId}/generate?jobId=${jobId}`)
    } catch (err) {
      console.error('Generation error:', err)
      toast.error('Generation failed', err instanceof Error ? err.message : 'Failed to generate assets')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {userCredits !== null && (
        <div className="flex items-center gap-1 text-xs text-[var(--mute)]">
          <Coins size={12} />
          <span>{userCredits} credits • 1 credit per generation</span>
        </div>
      )}
      <Button onClick={handleGenerate} disabled={loading} className="rounded-[var(--radius-pill)]">
        {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
        {loading ? 'Generating...' : 'Generate Assets'}
      </Button>
    </div>
  )
}
