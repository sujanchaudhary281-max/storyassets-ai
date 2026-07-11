import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Star, Zap } from 'lucide-react'

const tiers = [
  {
    name: 'Starter', price: '$5', period: '/month', featured: false,
    features: ['1 project', '3 generations/month', '1 language (English)', 'All device sizes', 'AI captions & overlays', 'PNG + ZIP downloads'],
    cta: 'Get Starter',
  },
  {
    name: 'Maker', price: '$19', period: '/month', featured: true,
    features: ['3 projects', '60 generations/month', '3 languages', 'Full-res export', 'Template gallery', 'AI captions & overlays', 'Drag-to-reorder editor'],
    cta: 'Get Maker',
  },
  {
    name: 'Pro', price: '$49', period: '/month', featured: false,
    features: ['Unlimited projects', '300 generations/month', 'Unlimited languages', 'Version history', 'A/B headline variants', 'API read access', 'Priority support'],
    cta: 'Get Pro',
  },
  {
    name: 'Agency', price: '$129', period: '/month', featured: false,
    features: ['Everything in Pro', '5 team seats', 'Client workspaces', 'White-label export', 'Full API access', 'Dedicated support'],
    cta: 'Get Agency',
  },
]

export default function PricingPage() {
  return (
    <div className="bg-[var(--canvas)] py-24">
      <div className="max-w-[1400px] mx-auto px-6 text-center">
        <p className="font-mono text-xs uppercase text-[var(--mute)] mb-3">Pricing</p>
        <h1 className="text-[48px] font-semibold tracking-[-2.4px] leading-[48px] mb-4">Simple, transparent pricing.</h1>
        <p className="text-lg text-[var(--body)] mb-16 max-w-lg mx-auto">Pick a plan that fits your workflow. Upgrade, downgrade, or cancel anytime.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto text-left">
          {tiers.map(tier => (
            <Card key={tier.name} className={`shadow-[var(--shadow-lg)] ${tier.featured ? 'bg-[var(--ink)] text-[var(--on-primary)] border-[var(--ink)] ring-2 ring-[var(--link)] ring-offset-2' : ''}`}>
              <CardContent className="p-6">
                <h2 className="text-base font-semibold mb-1">{tier.name}</h2>
                <p className="mb-5">
                  <span className="text-3xl font-semibold tracking-[-2px]">{tier.price}</span>
                  <span className={`text-sm ${tier.featured ? 'opacity-70' : 'text-[var(--mute)]'}`}>{tier.period}</span>
                </p>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${tier.featured ? 'opacity-90' : 'text-[var(--body)]'}`}>
                      <Check size={14} className={`mt-0.5 shrink-0 ${tier.featured ? 'opacity-70' : 'text-[var(--success)]'}`} />{f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={tier.featured ? 'secondary' : 'outline'} className="w-full rounded-[var(--radius-pill)] h-10 text-sm">
                  <Link href="/signup">{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Founding Maker Lifetime */}
        <div className="mt-12 max-w-xl mx-auto">
          <Card className="border-amber-300 bg-amber-50/50 shadow-[var(--shadow-lg)]">
            <CardContent className="p-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} className="text-amber-500" />
                <h3 className="font-semibold">Founding Maker Lifetime</h3>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Limited</span>
              </div>
              <p className="text-sm text-[var(--body)] mb-3">One-time payment of <strong>$199</strong> — Maker-tier access forever. Limited quantity.</p>
              <Button asChild variant="outline" className="rounded-[var(--radius-pill)] text-sm">
                <Link href="/signup">Claim Lifetime Access</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Credit Packs */}
        <div className="mt-8 max-w-xl mx-auto">
          <Card className="shadow-[var(--shadow-sm)]">
            <CardContent className="p-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-[var(--link)]" />
                <h3 className="font-semibold">Need more generations?</h3>
              </div>
              <p className="text-sm text-[var(--body)] mb-3">Buy credit packs on any paid plan when your monthly allotment is exceeded.</p>
              <div className="flex gap-3">
                <span className="text-sm border border-[var(--hairline)] rounded-[var(--radius-pill)] px-3 py-1">50 credits — $9</span>
                <span className="text-sm border border-[var(--hairline)] rounded-[var(--radius-pill)] px-3 py-1">200 credits — $29</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-2xl mx-auto text-left">
          <h2 className="text-2xl font-semibold tracking-[-0.96px] text-center mb-8">Billing FAQ</h2>
          <div className="space-y-6">
            {[
              { q: 'What counts as a generation?', a: 'One generation produces a full screenshot set for all selected device sizes in a single platform run.' },
              { q: 'Do unused generations roll over?', a: 'No. Monthly generation limits reset at the start of each billing cycle. Credit packs never expire.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel from the billing page. You keep access until the end of your billing period.' },
              { q: 'What\'s the Founding Maker Lifetime deal?', a: 'Pay $199 once and get Maker-tier limits permanently. Limited to the first 500 purchasers.' },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--hairline)] pb-6">
                <h3 className="text-base font-medium mb-2">{q}</h3>
                <p className="text-sm text-[var(--body)]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
