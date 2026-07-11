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
    toast.info('Generating assets', 'This may take up to 90 seconds...')
    
    try {
      const res = await fetch(`/api/projects/${projectId}/generate`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      const jobId = json.data.jobId
      // Poll until complete
      const poll = async () => {
        for (let i = 0; i < 60; i++) {
          await new Promise(r => setTimeout(r, 2000))
          const r = await fetch(`/api/jobs/${jobId}`)
          const j = await r.json()
          if (j.data?.job?.status === 'completed') {
            toast.success('Assets generated!', 'Your store assets are ready.')
            router.push(`/projects/${projectId}`)
            return
          }
          if (j.data?.job?.status === 'failed') {
            throw new Error(j.data.job.errorMessage ?? 'Generation failed')
          }
        }
        throw new Error('Generation timed out')
      }
      await poll()
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
