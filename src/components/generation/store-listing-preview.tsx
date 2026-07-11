'use client'

import { useRef } from 'react'
import type { GeneratedAsset } from '@prisma/client'
import type { Platform } from '@/lib/device-sizes'

interface Props {
  assets: GeneratedAsset[]
  projectName: string
  platform: Platform
  darkMode: boolean
  showFrame: boolean
}

export function StoreListingPreview({ assets, projectName, platform, darkMode, showFrame }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const bg = darkMode ? 'bg-[#1c1c1e]' : 'bg-white'
  const text = darkMode ? 'text-white' : 'text-[#1d1d1f]'
  const muted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const border = darkMode ? 'border-gray-700' : 'border-gray-200'

  return (
    <div className={`rounded-[var(--radius-md)] border ${border} ${bg} p-6 max-w-3xl mx-auto`}>
      {/* App header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-[18px] ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center text-lg font-bold ${text}`}>
          {projectName.charAt(0)}
        </div>
        <div>
          <h3 className={`font-semibold text-lg ${text}`}>{projectName}</h3>
          <p className={`text-sm ${muted}`}>
            {platform === 'ios' ? 'App Store' : 'Google Play'} · Screenshots
          </p>
        </div>
      </div>

      {/* Screenshot carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin"
      >
        {assets.map(asset => (
          <div
            key={asset.id}
            className="snap-start shrink-0"
            style={{ width: platform === 'ios' ? 180 : 160 }}
          >
            <div className={`relative rounded-lg overflow-hidden ${showFrame ? 'ring-2 ring-gray-800 ring-offset-2' : ''} ${darkMode ? 'ring-offset-[#1c1c1e]' : 'ring-offset-white'}`}>
              <img
                src={asset.storageKey}
                alt={asset.captionHeadline ?? `Screenshot ${asset.index}`}
                className="w-full h-auto"
                style={{ aspectRatio: `${asset.width}/${asset.height}` }}
              />
            </div>
            {asset.captionHeadline && (
              <p className={`text-xs mt-2 truncate ${muted}`}>{asset.captionHeadline}</p>
            )}
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <p className={`text-center py-8 text-sm ${muted}`}>No screenshots for this device size yet.</p>
      )}
    </div>
  )
}
