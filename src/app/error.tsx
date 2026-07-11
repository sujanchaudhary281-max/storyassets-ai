'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-full bg-[var(--error-soft)] mx-auto mb-4 flex items-center justify-center">
          <span className="text-[var(--error)] text-lg">!</span>
        </div>
        <h1 className="text-xl font-semibold tracking-[-0.6px] mb-2">Something went wrong</h1>
        <p className="text-sm text-[var(--body)] mb-6">An unexpected error occurred. Please try again.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline" className="rounded-[var(--radius-pill)]">Try again</Button>
          <Button asChild className="rounded-[var(--radius-pill)]"><Link href="/dashboard">Go to Dashboard</Link></Button>
        </div>
      </div>
    </div>
  )
}
