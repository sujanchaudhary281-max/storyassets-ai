'use client'

import { useState } from 'react'
import type { GeneratedAsset } from '@prisma/client'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Download } from 'lucide-react'

interface Props {
  assets: GeneratedAsset[]
  jobId: string
}

export function AssetGallery({ assets }: Props) {
  const [preview, setPreview] = useState<GeneratedAsset | null>(null)

  const platforms = [...new Set(assets.map(a => a.assetType.includes('ios') ? 'ios' : 'android'))]
  const [active, setActive] = useState(platforms[0] ?? 'ios')

  const filtered = assets.filter(a => a.assetType.includes(active))
  const getUrl = (asset: GeneratedAsset) => asset.storageKey

  return (
    <>
      {/* Platform selector - pill */}
      {platforms.length > 1 && (
        <div className="inline-flex rounded-full border border-[var(--hairline)] p-0.5 bg-[var(--canvas-soft)] mb-4">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => setActive(p)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${active === p ? 'bg-[var(--ink)] text-[var(--on-primary)] shadow-sm' : 'text-[var(--body)] hover:text-[var(--ink)]'}`}
            >
              {p === 'ios' ? `iOS (${assets.filter(a => a.assetType.includes('ios')).length})` : `Android (${assets.filter(a => a.assetType.includes('android')).length})`}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filtered.map(asset => (
          <AssetCard key={asset.id} asset={asset} onPreview={setPreview} url={getUrl(asset)} />
        ))}
      </div>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          {preview && (
            <div className="text-center">
              <img src={getUrl(preview)} alt={preview.assetType} className="max-h-[70vh] mx-auto rounded-[var(--radius-md)]" />
              <p className="text-sm text-[var(--mute)] mt-2">{preview.width}×{preview.height} · {preview.assetType}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function AssetCard({ asset, onPreview, url }: { asset: GeneratedAsset; onPreview: (a: GeneratedAsset) => void; url: string }) {
  return (
    <div className="group relative border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--canvas)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer" onClick={() => onPreview(asset)}>
      <div className="aspect-square bg-[var(--canvas-soft)] flex items-center justify-center p-2">
        <img src={url} alt={asset.assetType} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="p-2 border-t border-[var(--hairline)]">
        <p className="text-xs text-[var(--body)] truncate">{asset.assetType.replace(/_/g, ' ')}</p>
        <p className="text-xs text-[var(--mute)]">{asset.width}×{asset.height}</p>
      </div>
      <a href={url} download className="absolute top-2 right-2 w-7 h-7 bg-[var(--canvas)] border border-[var(--hairline)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()} aria-label="Download">
        <Download size={12} />
      </a>
    </div>
  )
}
