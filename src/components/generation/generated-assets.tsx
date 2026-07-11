'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageModal } from '@/components/ui/image-modal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Download, Loader2, Image as ImageIcon, FileArchive, Trash2 } from 'lucide-react'
import type { GeneratedAsset } from '@prisma/client'
import { toast } from '@/lib/toast'

interface GeneratedAssetsProps {
  assets: GeneratedAsset[]
  projectId: string
}

type BulkDownloadFormat = 'zip' | 'png' | 'jpeg'

export function GeneratedAssets({ assets, projectId }: GeneratedAssetsProps) {
  const [showSelectionModal, setShowSelectionModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDownloadModal, setShowBulkDownloadModal] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [selectedDeleteAssets, setSelectedDeleteAssets] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<string>('')
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null)

  const allAssetIds = assets.map(a => a.id)
  const allSelected = selectedAssets.size === assets.length && assets.length > 0
  const allDeleteSelected = selectedDeleteAssets.size === assets.length && assets.length > 0

  function toggleAsset(assetId: string) {
    const newSelected = new Set(selectedAssets)
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId)
    } else {
      newSelected.add(assetId)
    }
    setSelectedAssets(newSelected)
  }

  function toggleDeleteAsset(assetId: string) {
    const newSelected = new Set(selectedDeleteAssets)
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId)
    } else {
      newSelected.add(assetId)
    }
    setSelectedDeleteAssets(newSelected)
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedAssets(new Set())
    } else {
      setSelectedAssets(new Set(allAssetIds))
    }
  }

  function toggleAllDelete() {
    if (allDeleteSelected) {
      setSelectedDeleteAssets(new Set())
    } else {
      setSelectedDeleteAssets(new Set(allAssetIds))
    }
  }

  async function handleBulkDownload(format: BulkDownloadFormat) {
    if (selectedAssets.size === 0) {
      toast.warning('No assets selected', 'Please select at least one asset to download')
      return
    }

    try {
      setDownloading(true)
      setDownloadProgress('Preparing download...')
      const assetIds = Array.from(selectedAssets)
      
      const params = new URLSearchParams({
        format: format,
        assets: assetIds.join(','),
      })

      setDownloadProgress('Downloading...')
      const res = await fetch(`/api/projects/${projectId}/download?${params}`)
      
      if (!res.ok) {
        throw new Error('Download failed')
      }

      setDownloadProgress('Processing...')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `assets-${Date.now()}.${format === 'zip' ? 'zip' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setDownloadProgress('Complete!')
      toast.success('Download complete', 'Your assets have been downloaded successfully.')
      setShowBulkDownloadModal(false)
      setTimeout(() => setDownloadProgress(''), 2000)
    } catch (err) {
      console.error('Download error:', err)
      setDownloadProgress('')
      toast.error('Download failed', err instanceof Error ? err.message : 'Failed to download assets')
    } finally {
      setDownloading(false)
    }
  }

  function openSelectionModal() {
    setShowSelectionModal(true)
  }

  function closeSelectionModal() {
    setShowSelectionModal(false)
  }

  function proceedToDownload() {
    if (selectedAssets.size === 0) {
      toast.warning('No assets selected', 'Please select at least one asset to download')
      return
    }
    closeSelectionModal()
    setShowBulkDownloadModal(true)
  }

  function openDeleteModal() {
    setShowDeleteModal(true)
  }

  function closeDeleteModal() {
    setShowDeleteModal(false)
  }

  async function handleBulkDelete() {
    if (selectedDeleteAssets.size === 0) {
      toast.warning('No assets selected', 'Please select at least one asset to delete')
      return
    }

    try {
      setDeleting(true)
      const assetIds = Array.from(selectedDeleteAssets)
      
      // Delete each asset
      await Promise.all(
        assetIds.map(assetId =>
          fetch(`/api/assets/${assetId}`, {
            method: 'DELETE',
          })
        )
      )

      toast.success('Assets deleted', `${assetIds.length} asset${assetIds.length !== 1 ? 's have' : ' has'} been moved to trash.`)
      setShowDeleteModal(false)
      setSelectedDeleteAssets(new Set())
      
      // Refresh the page to show updated assets
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Delete failed', err instanceof Error ? err.message : 'Failed to delete assets')
    } finally {
      setDeleting(false)
    }
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-[var(--hairline)] rounded-[var(--radius-md)]">
        <ImageIcon size={32} className="mx-auto mb-3 text-[var(--mute)]" />
        <p className="text-sm text-[var(--mute)]">No assets generated yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Single row action bar */}
      <div className="flex items-center justify-between p-4 bg-[var(--canvas-soft)] rounded-[var(--radius-md)] border border-[var(--hairline)]">
        <div className="flex items-center gap-3">
          <FileArchive size={20} className="text-[var(--mute)]" />
          <div>
            <p className="text-sm font-medium">{assets.length} Generated Asset{assets.length !== 1 ? 's' : ''}</p>
            <p className="text-xs text-[var(--mute)]">Download individual or bulk assets</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openDeleteModal}
            className="rounded-[var(--radius-pill)] text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          >
            <Trash2 size={14} className="mr-2" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openSelectionModal}
            className="rounded-[var(--radius-pill)]"
          >
            <Download size={14} className="mr-2" />
            Select & Download
          </Button>
        </div>
      </div>

      {/* Asset Selection Modal */}
      <Dialog open={showSelectionModal} onOpenChange={setShowSelectionModal}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Assets to Download</DialogTitle>
            <DialogDescription>
              Choose the assets you want to download. {selectedAssets.size > 0 && `${selectedAssets.size} selected.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Select all checkbox */}
            <div className="flex items-center gap-2 p-3 bg-[var(--canvas-soft)] rounded-[var(--radius-sm)]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
              />
              <label className="text-sm font-medium cursor-pointer" onClick={toggleAll}>
                {allSelected ? 'Deselect All' : 'Select All'}
              </label>
            </div>

            {/* Assets grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map(asset => {
                const isSelected = selectedAssets.has(asset.id)
                const publicUrl = `/generated/${asset.storageKey}`
                
                return (
                  <div
                    key={asset.id}
                    onClick={() => toggleAsset(asset.id)}
                    className={`relative border rounded-[var(--radius-md)] overflow-hidden cursor-pointer transition-all ${
                      isSelected 
                        ? 'ring-2 ring-[var(--link)] border-[var(--link)]' 
                        : 'border-[var(--hairline)] hover:border-[var(--hairline-strong)]'
                    }`}
                  >
                    {/* Checkbox overlay */}
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleAsset(asset.id)}
                        className="bg-white shadow-sm"
                      />
                    </div>

                    {/* Asset preview */}
                    <div 
                      className="aspect-[9/16] bg-[var(--canvas-soft-2)] relative hover:opacity-90 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewImage({ src: publicUrl, alt: asset.captionHeadline || 'Screenshot' })
                      }}
                    >
                      <img
                        src={publicUrl}
                        alt={asset.captionHeadline || 'Screenshot'}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Asset info */}
                    <div className="p-2 bg-[var(--canvas)] border-t border-[var(--hairline)]">
                      <p className="text-xs font-medium truncate">{asset.captionHeadline || 'Screenshot'}</p>
                      <p className="text-[10px] text-[var(--mute)] mt-0.5">
                        {asset.platform?.toUpperCase()} • {asset.width}×{asset.height}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--hairline)]">
              <Button
                variant="outline"
                onClick={closeSelectionModal}
              >
                Cancel
              </Button>
              <Button
                onClick={proceedToDownload}
                disabled={selectedAssets.size === 0}
              >
                Continue ({selectedAssets.size} selected)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Download Format Modal */}
      <Dialog open={showBulkDownloadModal} onOpenChange={setShowBulkDownloadModal}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose Download Format</DialogTitle>
            <DialogDescription>
              Select the format for downloading {selectedAssets.size} asset{selectedAssets.size !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => handleBulkDownload('jpeg')}
              disabled={downloading}
            >
              <div className="text-left">
                <div className="font-medium">JPEG</div>
                <div className="text-xs text-[var(--mute)]">Compressed format, smaller file size</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => handleBulkDownload('png')}
              disabled={downloading}
            >
              <div className="text-left">
                <div className="font-medium">PNG</div>
                <div className="text-xs text-[var(--mute)]">Lossless format, better quality</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => handleBulkDownload('zip')}
              disabled={downloading}
            >
              <div className="text-left">
                <div className="font-medium">ZIP Archive</div>
                <div className="text-xs text-[var(--mute)]">All assets in a single archive</div>
              </div>
            </Button>

            {downloading && (
              <div className="flex items-center justify-center gap-2 p-3 bg-[var(--canvas-soft)] rounded-[var(--radius-sm)]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">{downloadProgress}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <ImageModal
        src={previewImage?.src || ''}
        alt={previewImage?.alt || ''}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />

      {/* Delete Selection Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Assets to Delete</DialogTitle>
            <DialogDescription>
              Choose the assets you want to delete. They will be moved to trash. {selectedDeleteAssets.size > 0 && `${selectedDeleteAssets.size} selected.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Select all checkbox */}
            <div className="flex items-center gap-2 p-3 bg-[var(--canvas-soft)] rounded-[var(--radius-sm)]">
              <Checkbox
                checked={allDeleteSelected}
                onCheckedChange={toggleAllDelete}
              />
              <label className="text-sm font-medium cursor-pointer" onClick={toggleAllDelete}>
                {allDeleteSelected ? 'Deselect All' : 'Select All'}
              </label>
            </div>

            {/* Assets grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map(asset => {
                const isSelected = selectedDeleteAssets.has(asset.id)
                const publicUrl = `/generated/${asset.storageKey}`
                
                return (
                  <div
                    key={asset.id}
                    onClick={() => toggleDeleteAsset(asset.id)}
                    className={`relative border rounded-[var(--radius-md)] overflow-hidden cursor-pointer transition-all ${
                      isSelected 
                        ? 'ring-2 ring-red-500 border-red-500' 
                        : 'border-[var(--hairline)] hover:border-[var(--hairline-strong)]'
                    }`}
                  >
                    {/* Checkbox overlay */}
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleDeleteAsset(asset.id)}
                        className="bg-white shadow-sm"
                      />
                    </div>

                    {/* Asset preview */}
                    <div 
                      className="aspect-[9/16] bg-[var(--canvas-soft-2)] relative hover:opacity-90 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewImage({ src: publicUrl, alt: asset.captionHeadline || 'Screenshot' })
                      }}
                    >
                      <img
                        src={publicUrl}
                        alt={asset.captionHeadline || 'Screenshot'}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Asset info */}
                    <div className="p-2 bg-[var(--canvas)] border-t border-[var(--hairline)]">
                      <p className="text-xs font-medium truncate">{asset.captionHeadline || 'Screenshot'}</p>
                      <p className="text-[10px] text-[var(--mute)] mt-0.5">
                        {asset.platform?.toUpperCase()} • {asset.width}×{asset.height}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--hairline)]">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={selectedDeleteAssets.size === 0 || deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} className="mr-2" />
                    Delete ({selectedDeleteAssets.size} selected)
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
