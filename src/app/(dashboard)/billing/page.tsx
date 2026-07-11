import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PLAN_LIMITS } from '@/lib/stripe'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ManageSubscriptionButton } from '@/components/billing/manage-subscription-button'
import { Check, Star, Zap } from 'lucide-react'
import Link from 'next/link'

const planTiers = [
  {
    name: 'Starter', price: '$5', period: '/month',
    features: ['1 project', '3 generations/month', '1 language (English)', 'All device sizes', 'AI captions & overlays', 'PNG + ZIP downloads'],
  },
  {
    name: 'Maker', price: '$19', period: '/month',
    features: ['3 projects', '60 generations/month', '3 languages', 'Full-res export', 'Template gallery', 'AI captions & overlays', 'Drag-to-reorder editor'],
  },
  {
    name: 'Pro', price: '$49', period: '/month',
    features: ['Unlimited projects', '300 generations/month', 'Unlimited languages', 'Version history', 'A/B headline variants', 'API read access', 'Priority support'],
  },
  {
    name: 'Agency', price: '$129', period: '/month',
    features: ['Everything in Pro', '5 team seats', 'Client workspaces', 'White-label export', 'Full API access', 'Dedicated support'],
  },
]

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  })

  if (!user) redirect('/login')

  const plan = user.subscription?.plan ?? 'free'
  const status = user.subscription?.status ?? 'inactive'
  const periodEnd = user.subscription?.currentPeriodEnd
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? { monthlyGenerations: 3, maxProjects: 1, maxLanguages: 1, features: [] }

  const usedGenerations = await prisma.generationJob.count({
    where: {
      userId: user.id,
      createdAt: { gte: user.subscription?.currentPeriodStart ?? new Date(0) },
    },
  })

  const remaining = Math.max(0, limit.monthlyGenerations - usedGenerations)
  const progressPct = limit.monthlyGenerations > 0 ? Math.min(100, (usedGenerations / limit.monthlyGenerations) * 100) : 0

  // Get status badge color
  const statusColor = status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 
                     status === 'trialing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 
                     status === 'past_due' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 
                     'bg-gray-100 text-gray-800'

  const currentPlanTier = planTiers.find(t => t.name.toLowerCase() === plan.toLowerCase())

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-[-0.96px]">Billing &amp; Usage</h1>
        <p className="text-sm text-[var(--body)] mt-1">Manage your subscription and view usage</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Current Plan Card */}
        <Card className="shadow-[var(--shadow-sm)] lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-2xl font-semibold capitalize">{plan}</p>
                  <Badge variant="secondary" className={`text-xs ${statusColor}`}>
                    {status}
                  </Badge>
                </div>
                {currentPlanTier && (
                  <p className="text-lg text-[var(--mute)]">
                    {currentPlanTier.price}<span className="text-sm">{currentPlanTier.period}</span>
                  </p>
                )}
              </div>
              {periodEnd && (
                <div className="text-right">
                  <p className="text-xs text-[var(--mute)]">Period ends</p>
                  <p className="text-sm font-medium">{new Date(periodEnd).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            
            {user.subscription?.cancelAtPeriodEnd && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-sm)] text-sm text-amber-700 mb-4">
                Your subscription will be canceled at the end of the current period.
              </div>
            )}

            {currentPlanTier && (
              <div className="pt-4 border-t border-[var(--hairline)]">
                <p className="text-sm font-medium mb-3">Plan Features:</p>
                <ul className="space-y-2">
                  {currentPlanTier.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[var(--body)]">
                      <Check size={14} className="mt-0.5 shrink-0 text-[var(--success)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credits Card */}
        <Card className="shadow-[var(--shadow-sm)]">
          <CardHeader>
            <CardTitle>Credit Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-semibold mb-2">{user.creditBalance ?? 0}</p>
              <p className="text-xs text-[var(--mute)]">Available credits</p>
              <Badge variant="outline" className="text-xs mt-3">
                1 credit = 1 generation
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Generations Card */}
      <Card className="shadow-[var(--shadow-sm)] mb-8">
        <CardHeader>
          <CardTitle>Monthly Generations Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-semibold">{usedGenerations}</span>
            <span className="text-sm text-[var(--mute)]">of {limit.monthlyGenerations} used</span>
            <span className="ml-auto text-sm font-medium text-[var(--link)]">{remaining} remaining</span>
          </div>
          <div className="h-3 bg-[var(--canvas-soft-2)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPct >= 90 ? 'bg-red-500' : progressPct >= 70 ? 'bg-orange-500' : 'bg-[var(--link)]'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-[var(--mute)] mt-2">
            Resets on {periodEnd ? new Date(periodEnd).toLocaleDateString() : 'subscription renewal'}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mb-8">
        <ManageSubscriptionButton hasSubscription={!!user.subscription?.stripeCustomerId} />
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold tracking-[-0.6px] mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {planTiers.map(tier => {
            const isCurrentPlan = tier.name.toLowerCase() === plan.toLowerCase()
            return (
              <Card key={tier.name} className={`shadow-[var(--shadow-sm)] ${isCurrentPlan ? 'ring-2 ring-[var(--link)]' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">{tier.name}</h3>
                    {isCurrentPlan && (
                      <Badge variant="default" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="mb-4">
                    <span className="text-2xl font-semibold tracking-[-1px]">{tier.price}</span>
                    <span className="text-sm text-[var(--mute)]">{tier.period}</span>
                  </p>
                  <ul className="space-y-2 mb-4">
                    {tier.features.slice(0, 4).map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-[var(--body)]">
                        <Check size={12} className="mt-0.5 shrink-0 text-[var(--success)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrentPlan && (
                    <Button asChild variant="outline" size="sm" className="w-full rounded-[var(--radius-pill)]">
                      <Link href="/pricing">View Details</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Credit Packs */}
      <Card className="shadow-[var(--shadow-sm)] mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Zap size={20} className="text-[var(--link)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Need more generations?</h3>
              <p className="text-sm text-[var(--body)] mb-3">
                Buy credit packs when your monthly allotment is exceeded. Credits never expire.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" size="sm" className="rounded-[var(--radius-pill)]">
                  50 credits — $9
                </Button>
                <Button variant="outline" size="sm" className="rounded-[var(--radius-pill)]">
                  200 credits — $29
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Founding Maker Lifetime */}
      <Card className="border-amber-300 bg-amber-50/50 shadow-[var(--shadow-sm)] mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Star size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Founding Maker Lifetime</h3>
                <Badge className="text-xs bg-amber-200 text-amber-800 border-amber-300">Limited</Badge>
              </div>
              <p className="text-sm text-[var(--body)] mb-3">
                One-time payment of <strong>$199</strong> — Maker-tier access forever. Limited quantity.
              </p>
              <Button asChild variant="outline" size="sm" className="rounded-[var(--radius-pill)]">
                <Link href="/pricing">Learn More</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
