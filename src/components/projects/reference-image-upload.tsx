'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, AlertTriangle } from 'lucide-react'

interface ReferenceImage {
  id: string
  storageKey: string
  originalFilename: string
  rightsConfirmed: boolean
}

interface Props {
  projectId: string
  initialImages: ReferenceImage[]
}

export function ReferenceImageUpload({ projectId, initialImages }: Props) {
  const [images, setImages] = useState<ReferenceImage[]>(initialImages)
  const [rightsConfirmed, setRightsConfirmed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    if (!rightsConfirmed) {
      setError('You must confirm you have rights to use this image')
      return
    }
    setError(null)
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('rightsConfirmed', 'true')

    const res = await fetch(`/api/projects/${projectId}/reference-images`, { method: 'POST', body: formData })
    const json = await res.json()
    if (json.success) setImages(prev => [...prev, json.data])
    else setError(json.error ?? 'Upload failed')
    setUploading(false)
  }

  async function removeImage(imageId: string) {
    await fetch(`/api/projects/${projectId}/reference-images`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    })
    setImages(prev => prev.filter(i => i.id !== imageId))
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Reference Images</h3>
      <p className="text-xs text-[var(--mute)]">Upload UI screenshots or inspiration images to guide the AI style.</p>

      {/* Rights confirmation */}
      <label className="flex items-start gap-2 p-3 border border-[var(--hairline)] rounded-[var(--radius-sm)] cursor-pointer hover:border-[var(--link)] transition-colors">
        <input type="checkbox" checked={rightsConfirmed} onChange={e => { setRightsConfirmed(e.target.checked); setError(null) }} className="mt-0.5" />
        <span className="text-xs text-[var(--body)]">
          I confirm I have the rights to use these images as reference material for AI-assisted design generation.
        </span>
      </label>

      {error && (
        <div className="flex items-center gap-2 text-xs text-[var(--error)] p-2 bg-[var(--error-soft)] rounded">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Upload area */}
      <div className="flex gap-3 flex-wrap">
        {images.map(img => (
          <div key={img.id} className="relative w-20 h-20 border border-[var(--hairline)] rounded overflow-hidden group">
            <img src={img.storageKey} alt={img.originalFilename} className="w-full h-full object-cover" />
            <button onClick={() => removeImage(img.id)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove">
              <X size={10} className="text-white" />
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={!rightsConfirmed || uploading}
          className="w-20 h-20 border-2 border-dashed border-[var(--hairline)] rounded flex flex-col items-center justify-center text-[var(--mute)] hover:border-[var(--link)] hover:text-[var(--link)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Upload size={16} />
          <span className="text-[9px] mt-1">{uploading ? 'Uploading' : 'Upload'}</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = '' }} />
    </div>
  )
}
