'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'

export function ManageSubscriptionButton({ hasSubscription }: { hasSubscription: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleManage() {
    if (!hasSubscription) {
      toast.info('No subscription', 'You do not have an active subscription yet.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to open customer portal')
      }

      const json = await res.json()
      if (json.data?.portalUrl) {
        window.location.href = json.data.portalUrl
      } else {
        throw new Error('No portal URL returned')
      }
    } catch (error) {
      console.error('Portal error:', error)
      toast.error('Failed to open portal', error instanceof Error ? error.message : 'Please try again later')
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleManage} 
      disabled={loading}
      className="rounded-[var(--radius-pill)]"
    >
      {loading ? (
        <>
          <Loader2 size={14} className="mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <ExternalLink size={14} className="mr-2" />
          Manage Subscription
        </>
      )}
    </Button>
  )
}
