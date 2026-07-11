'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STEPS = [
  'Analyzing your app description',
  'Writing screenshot captions',
  'Compositing screenshots',
  'Packaging assets',
]

export default function GeneratePage() {
  return <Suspense><GenerateContent /></Suspense>
}

function GenerateContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobId = searchParams.get('jobId')
  const [status, setStatus] = useState<string>('pending')
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!jobId) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        const json = await res.json()
        if (json.data?.job) {
          setStatus(json.data.job.status)
          if (json.data.job.status === 'completed') {
            clearInterval(interval)
            router.push(`/projects/${params.id}`)
          }
          if (json.data.job.status === 'failed') {
            clearInterval(interval)
            setError(json.data.job.errorMessage ?? 'Generation failed')
          }
          if (json.data.job.status === 'processing') {
            setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))
          }
        }
      } catch { /* retry next tick */ }
    }, 3000)
    return () => clearInterval(interval)
  }, [jobId, router, params.id])

  useEffect(() => {
    if (status === 'pending' || status === 'processing') {
      const t = setInterval(() => setElapsed(e => e + 1), 1000)
      return () => clearInterval(t)
    }
  }, [status])

  return (
    <div className="max-w-lg mx-auto mt-12">
      <h1 className="text-2xl font-semibold tracking-[-0.96px] text-center mb-2">Generating your assets</h1>
      <p className="text-sm text-[var(--body)] text-center mb-8">This usually takes 60–90 seconds. We'll email you when it's done.</p>

      <div className="space-y-3 mb-8">
        {STEPS.map((step, i) => {
          const done = i < currentStep
          const active = i === currentStep && status === 'processing'
          return (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-all ${active ? 'bg-[var(--canvas)] shadow-[var(--shadow-sm)]' : done ? 'opacity-100' : 'opacity-40'}`}>
              {done ? (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"><Check size={12} className="text-white" /></div>
              ) : active ? (
                <Loader2 size={20} className="animate-spin text-[var(--link)]" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-[var(--hairline)]" />
              )}
              <span className="text-sm">{step}</span>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-[var(--mute)] font-mono">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} elapsed</p>

      {error && (
        <div className="mt-6 p-4 bg-[var(--error-soft)] rounded-[var(--radius-sm)] text-center">
          <AlertCircle size={20} className="mx-auto mb-2 text-[var(--error)]" />
          <p className="text-sm text-[var(--error)]">{error}</p>
          <Button variant="outline" className="mt-3 rounded-[var(--radius-pill)]" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      )}
    </div>
  )
}
