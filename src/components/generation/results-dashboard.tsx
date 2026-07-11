'use client'

import { useState } from 'react'
import type { GeneratedAsset, LocalizedAsset, ProjectLocale } from '@prisma/client'
import { DEVICE_SIZES, type Platform } from '@/lib/device-sizes'
import { SUPPORTED_LOCALES } from '@/lib/locales'
import { StoreListingPreview } from './store-listing-preview'
import { ScreenshotGrid } from './screenshot-grid'
import { Switch } from '@/components/ui/switch'
import { Monitor, Moon, Sun, Smartphone, Globe } from 'lucide-react'

type AssetWithLocalized = GeneratedAsset & {
  localizedAssets?: (LocalizedAsset & { locale: ProjectLocale })[]
}

interface Props {
  assets: AssetWithLocalized[]
  jobId: string
  projectId: string
  projectName: string
  locales?: { code: string; id: string }[]
}

export function ResultsDashboard({ assets, jobId, projectId, projectName, locales = [] }: Props) {
  const [darkMode, setDarkMode] = useState(false)
  const [showFrame, setShowFrame] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'preview'>('grid')
  const [activeLocale, setActiveLocale] = useState<string | null>(null)

  const [activePlatform, setActivePlatform] = useState<Platform>('ios')

  const sizes = DEVICE_SIZES[activePlatform]
  const sizeEntries = Object.entries(sizes) as [string, { label: string; width: number; height: number }][]
  const [activeSize, setActiveSize] = useState(sizeEntries[0]?.[0] ?? '')

  function switchPlatform(p: Platform) {
    setActivePlatform(p)
    const newSizes = Object.keys(DEVICE_SIZES[p])
    setActiveSize(newSizes[0] ?? '')
  }

  // Apply locale overlay on assets if a language is selected
  const filteredAssets = assets
    .filter(a => a.platform === activePlatform && a.deviceSize === activeSize)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(a => {
      if (!activeLocale) return a
      const localized = a.localizedAssets?.find(la => la.locale.locale === activeLocale)
      if (!localized) return a
      return {
        ...a,
        captionHeadline: localized.captionHeadline ?? a.captionHeadline,
        captionSubtext: localized.captionSubtext ?? a.captionSubtext,
        storageKey: localized.storageKey ?? a.storageKey,
      }
    })

  return (
    <div className="space-y-5">
      {/* Controls bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* View Mode Toggle - Segmented Control */}
        <div className="inline-flex rounded-full border border-[var(--hairline)] p-0.5 bg-[var(--canvas-soft)]">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              viewMode === 'grid' 
                ? 'bg-[var(--ink)] text-[var(--on-primary)] shadow-sm' 
                : 'text-[var(--body)] hover:text-[var(--ink)]'
            }`}
          >
            <Smartphone size={14} />
            Grid View
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              viewMode === 'preview' 
                ? 'bg-[var(--ink)] text-[var(--on-primary)] shadow-sm' 
                : 'text-[var(--body)] hover:text-[var(--ink)]'
            }`}
          >
            <Monitor size={14} />
            Store Preview
          </button>
        </div>

        {/* Dark Mode and Frame Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun size={14} className="text-[var(--mute)]" />
            <Switch checked={darkMode} onCheckedChange={setDarkMode} size="sm" />
            <Moon size={14} className="text-[var(--mute)]" />
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--body)]">
            <Switch checked={showFrame} onCheckedChange={setShowFrame} size="sm" />
            Device Frame
          </label>
        </div>
      </div>

      {/* Platform selector - pill style */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex rounded-full border border-[var(--hairline)] p-0.5 bg-[var(--canvas-soft)]">
          {(['ios', 'android'] as Platform[]).map(p => (
            <button
              key={p}
              onClick={() => switchPlatform(p)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${activePlatform === p ? 'bg-[var(--ink)] text-[var(--on-primary)] shadow-sm' : 'text-[var(--body)] hover:text-[var(--ink)]'}`}
            >
              {p === 'ios' ? 'iOS' : 'Android'}
            </button>
          ))}
        </div>

        {/* Language selector */}
        {locales.length > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--hairline)] bg-[var(--canvas-soft)]">
            <Globe size={13} className="text-[var(--mute)]" />
            <select
              value={activeLocale ?? ''}
              onChange={e => setActiveLocale(e.target.value || null)}
              className="text-xs font-medium bg-transparent border-none outline-none cursor-pointer text-[var(--body)]"
            >
              <option value="">Original</option>
              {locales.map(l => {
                const info = SUPPORTED_LOCALES.find(s => s.code === l.code)
                return <option key={l.code} value={l.code}>{info?.name ?? l.code}</option>
              })}
            </select>
          </div>
        )}
      </div>

      {/* Device size selector - underline style */}
      <div className="flex gap-1 border-b border-[var(--hairline)]">
        {sizeEntries.map(([key, info]) => (
          <button
            key={key}
            onClick={() => setActiveSize(key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${activeSize === key ? 'border-[var(--ink)] text-[var(--ink)]' : 'border-transparent text-[var(--mute)] hover:text-[var(--body)]'}`}
          >
            {info.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === 'preview' ? (
        <StoreListingPreview
          assets={filteredAssets}
          projectName={projectName}
          platform={activePlatform}
          darkMode={darkMode}
          showFrame={showFrame}
        />
      ) : (
        <ScreenshotGrid
          assets={filteredAssets}
          jobId={jobId}
          projectId={projectId}
          showFrame={showFrame}
        />
      )}
    </div>
  )
}
