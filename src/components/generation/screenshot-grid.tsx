'use client'

import { useState } from 'react'
import type { GeneratedAsset } from '@prisma/client'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Download, Edit, GripVertical, Copy, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'

interface Props {
  assets: GeneratedAsset[]
  jobId: string
  projectId: string
  showFrame: boolean
}

export function ScreenshotGrid({ assets: initialAssets, jobId, projectId, showFrame }: Props) {
  const [assets, setAssets] = useState(initialAssets)
  const [preview, setPreview] = useState<GeneratedAsset | null>(null)
  const [downloadModal, setDownloadModal] = useState<{ assetId: string; asset: GeneratedAsset } | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = assets.findIndex(a => a.id === active.id)
    const newIndex = assets.findIndex(a => a.id === over.id)
    const reordered = arrayMove(assets, oldIndex, newIndex)
    setAssets(reordered)

    // Persist new order
    await fetch(`/api/projects/${projectId}/screenshots/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetIds: reordered.map(a => a.id) }),
    })
  }

  async function handleDownload(assetId: string, format: 'png' | 'jpeg') {
    try {
      const res = await fetch(`/api/assets/${assetId}/download?format=${format}`)
      
      if (!res.ok) {
        throw new Error('Download failed')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `asset-${assetId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Download complete')
      setDownloadModal(null)
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Download failed', err instanceof Error ? err.message : 'Failed to download asset')
    }
  }

  async function handleDuplicate(assetId: string) {
    try {
      const res = await fetch(`/api/assets/${assetId}/duplicate`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Duplicate failed')
      }

      toast.success('Asset duplicated', 'A copy of the asset has been created.')
      // Refresh to show the duplicated asset
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error('Duplicate error:', err)
      toast.error('Duplicate failed', err instanceof Error ? err.message : 'Failed to duplicate asset')
    }
  }

  async function handleDelete(assetId: string) {
    if (!confirm('Move this asset to trash?')) {
      return
    }

    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Delete failed')
      }

      toast.success('Asset deleted', 'The asset has been moved to trash.')
      // Refresh the page to show updated assets
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Delete failed', err instanceof Error ? err.message : 'Failed to delete asset')
    }
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={assets.map(a => a.id)} strategy={horizontalListSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {assets.map(asset => (
              <SortableAssetCard
                key={asset.id}
                asset={asset}
                showFrame={showFrame}
                onPreview={setPreview}
                onDownload={(assetId) => setDownloadModal({ assetId, asset })}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                projectId={projectId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Preview Modal */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          {preview && (
            <div className="text-center">
              <img src={preview.storageKey} alt={preview.captionHeadline ?? ''} className="max-h-[70vh] mx-auto rounded-[var(--radius-md)]" />
              <p className="text-sm text-[var(--mute)] mt-2">{preview.width}×{preview.height} · {preview.deviceSize}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Download Format Modal */}
      <Dialog open={!!downloadModal} onOpenChange={() => setDownloadModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Download Format</DialogTitle>
            <DialogDescription>
              Select the format for downloading this asset
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => downloadModal && handleDownload(downloadModal.assetId, 'jpeg')}
            >
              <div className="text-left">
                <div className="font-medium">JPEG</div>
                <div className="text-xs text-[var(--mute)]">Compressed format, smaller file size</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => downloadModal && handleDownload(downloadModal.assetId, 'png')}
            >
              <div className="text-left">
                <div className="font-medium">PNG</div>
                <div className="text-xs text-[var(--mute)]">Lossless format, better quality</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SortableAssetCard({ asset, showFrame, onPreview, onDownload, onDuplicate, onDelete, projectId }: {
  asset: GeneratedAsset
  showFrame: boolean
  onPreview: (a: GeneratedAsset) => void
  onDownload: (assetId: string) => void
  onDuplicate: (assetId: string) => void
  onDelete: (assetId: string) => void
  projectId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: asset.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="group relative border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--canvas)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
      {/* Drag handle */}
      <button {...attributes} {...listeners} className="absolute top-2 left-2 z-10 w-6 h-6 bg-[var(--canvas)]/80 border border-[var(--hairline)] rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" aria-label="Drag to reorder">
        <GripVertical size={12} />
      </button>

      <div className={`aspect-[9/19] bg-[var(--canvas-soft)] flex items-center justify-center p-1 cursor-pointer ${showFrame ? 'ring-1 ring-inset ring-gray-300 rounded-sm m-1' : ''}`} onClick={() => onPreview(asset)}>
        <img src={asset.storageKey} alt={asset.captionHeadline ?? ''} className="max-w-full max-h-full object-contain" />
      </div>

      <div className="p-2 border-t border-[var(--hairline)]">
        <p className="text-xs text-[var(--body)] truncate">{asset.captionHeadline ?? `Screenshot ${(asset.index ?? 0) + 1}`}</p>
        <p className="text-xs text-[var(--mute)]">{asset.width}×{asset.height}</p>
      </div>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={`/projects/${projectId}/editor/${asset.id}`} className="w-7 h-7 bg-[var(--canvas)] border border-[var(--hairline)] rounded-full flex items-center justify-center hover:bg-[var(--canvas-soft)]" onClick={e => e.stopPropagation()} aria-label="Edit">
          <Edit size={12} />
        </a>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onDownload(asset.id)
          }} 
          className="w-7 h-7 bg-[var(--canvas)] border border-[var(--hairline)] rounded-full flex items-center justify-center hover:bg-[var(--canvas-soft)]" 
          aria-label="Download"
        >
          <Download size={12} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate(asset.id)
          }} 
          className="w-7 h-7 bg-[var(--canvas)] border border-[var(--hairline)] rounded-full flex items-center justify-center hover:bg-[var(--canvas-soft)]" 
          aria-label="Duplicate"
        >
          <Copy size={12} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onDelete(asset.id)
          }} 
          className="w-7 h-7 bg-[var(--canvas)] border border-red-200 rounded-full flex items-center justify-center hover:bg-red-50 text-red-600" 
          aria-label="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
