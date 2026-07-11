'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SUPPORTED_LOCALES } from '@/lib/locales'
import { Check, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface LocalizedAssetData {
  id: string
  captionHeadline: string | null
  captionSubtext: string | null
  status: string
  overflowDetected: boolean
  suggestedFontSize: number | null
  asset: { id: string; captionHeadline: string | null; captionSubtext: string | null; storageKey: string; width: number; height: number }
}

interface Props {
  projectId: string
  localeId: string
  locale: string
  localizedAssets: LocalizedAssetData[]
  status: string
}

export function LocaleReview({ projectId, localeId, locale, localizedAssets, status }: Props) {
  const [assets, setAssets] = useState(localizedAssets)
  const [approving, setApproving] = useState(false)
  const localeName = SUPPORTED_LOCALES.find(l => l.code === locale)?.name ?? locale

  async function approveAll() {
    setApproving(true)
    await fetch(`/api/projects/${projectId}/locales/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localeId, action: 'approve' }),
    })
    setAssets(a => a.map(x => ({ ...x, status: 'approved' })))
    setApproving(false)
  }

  async function approveOne(assetId: string) {
    await fetch(`/api/projects/${projectId}/locales/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localeId, action: 'approve', assetIds: [assetId] }),
    })
    setAssets(a => a.map(x => x.id === assetId ? { ...x, status: 'approved' } : x))
  }

  const allApproved = assets.every(a => a.status === 'approved')
  const overflowCount = assets.filter(a => a.overflowDetected).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/projects/${projectId}`} className="text-sm text-[var(--link)] flex items-center gap-1 mb-1">
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="text-xl font-semibold">Review: {localeName}</h1>
          <p className="text-sm text-[var(--mute)]">{assets.length} screenshots · {overflowCount > 0 ? `${overflowCount} overflow warning(s)` : 'No overflow issues'}</p>
        </div>
        <div className="flex gap-2">
          {!allApproved && (
            <Button onClick={approveAll} disabled={approving} className="text-xs">
              <Check size={14} className="mr-1" /> {approving ? 'Approving...' : 'Approve All'}
            </Button>
          )}
          {allApproved && <Badge className="bg-green-100 text-green-800">All Approved ✓</Badge>}
        </div>
      </div>

      {/* Side-by-side cards */}
      <div className="space-y-4">
        {assets.map(la => (
          <div key={la.id} className={`border rounded-[var(--radius-md)] p-4 ${la.overflowDetected ? 'border-amber-300 bg-amber-50/50' : 'border-[var(--hairline)]'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={la.status === 'approved' ? 'default' : 'outline'} className="text-[10px]">{la.status}</Badge>
              {la.overflowDetected && (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle size={12} /> Text overflow detected
                  {la.suggestedFontSize && <span className="text-[10px]">(suggested: {la.suggestedFontSize}px)</span>}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Original */}
              <div>
                <p className="text-[10px] font-medium text-[var(--mute)] uppercase mb-1">Original</p>
                <div className="p-3 bg-[var(--canvas-soft)] rounded border border-[var(--hairline)]">
                  <p className="text-sm font-semibold">{la.asset.captionHeadline}</p>
                  <p className="text-xs text-[var(--body)] mt-1">{la.asset.captionSubtext}</p>
                </div>
              </div>
              {/* Translated */}
              <div>
                <p className="text-[10px] font-medium text-[var(--mute)] uppercase mb-1">{localeName}</p>
                <div className={`p-3 rounded border ${la.overflowDetected ? 'border-amber-300 bg-amber-50' : 'border-[var(--hairline)] bg-[var(--canvas-soft)]'}`}>
                  <p className="text-sm font-semibold">{la.captionHeadline}</p>
                  <p className="text-xs text-[var(--body)] mt-1">{la.captionSubtext}</p>
                </div>
              </div>
            </div>

            {la.status !== 'approved' && (
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => approveOne(la.id)}>
                  <Check size={12} className="mr-1" /> Approve
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
