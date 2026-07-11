'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface Props {
  name: string
  price: string
  period: string
  features: string[]
  current?: boolean
  featured?: boolean
}

export function PlanCard({ name, price, period, features, current, featured }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' })
      const json = await res.json()
      if (json.data?.checkoutUrl) window.location.href = json.data.checkoutUrl
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  async function handleManage() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const json = await res.json()
      if (json.data?.portalUrl) window.location.href = json.data.portalUrl
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  return (
    <Card className={`shadow-[var(--shadow-md)] ${featured ? 'bg-[var(--ink)] text-[var(--on-primary)] border-[var(--ink)]' : ''}`}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-1">{name}</h3>
        <p className="mb-4">
          <span className="text-3xl font-semibold tracking-[-1.28px]">{price}</span>
          <span className={`text-sm ${featured ? 'opacity-70' : 'text-[var(--mute)]'}`}>{period}</span>
        </p>
        <ul className="space-y-2 mb-6">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check size={14} className={featured ? 'opacity-70' : 'text-[var(--success)]'} />
              {f}
            </li>
          ))}
        </ul>
        {current ? (
          <Button variant={featured ? 'secondary' : 'outline'} className="w-full rounded-[var(--radius-pill)]" disabled={!featured && !current} onClick={featured ? handleManage : undefined}>
            {featured ? 'Manage Subscription' : 'Current Plan'}
          </Button>
        ) : featured ? (
          <Button variant="secondary" className="w-full rounded-[var(--radius-pill)]" onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Loading...' : 'Upgrade to Pro'}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
