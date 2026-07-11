'use client'

import { useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'

interface Props {
  screenshots: string[]
  onChange: (urls: string[]) => void
  projectId?: string
}

export function ScreenshotUploader({ screenshots, onChange }: Props) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFiles = useCallback(async (files: FileList) => {
    const valid = Array.from(files).filter(f => ['image/png', 'image/jpeg'].includes(f.type) && f.size <= 10 * 1024 * 1024)
    setUploading(true)
    const urls: string[] = [...screenshots]
    for (const file of valid) {
      const url = URL.createObjectURL(file)
      urls.push(url)
    }
    onChange(urls)
    setUploading(false)
  }, [screenshots, onChange])

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-[var(--radius-md)] p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-[var(--link)] bg-[var(--link-bg-soft)]' : 'border-[var(--hairline)] hover:border-[var(--hairline-strong)]'}`}
        onClick={() => document.getElementById('screenshot-input')?.click()}
      >
        <Upload size={24} className="mx-auto mb-2 text-[var(--mute)]" />
        <p className="text-sm text-[var(--body)]">{uploading ? 'Uploading...' : 'Drag & drop or click to upload'}</p>
        <p className="text-xs text-[var(--mute)] mt-1">PNG or JPG, max 10MB each</p>
      </div>
      <input id="screenshot-input" type="file" accept="image/png,image/jpeg" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />

      {screenshots.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
          {screenshots.map((url, i) => (
            <div key={i} className="relative aspect-[9/16] rounded-[var(--radius-sm)] overflow-hidden border border-[var(--hairline)] bg-[var(--canvas-soft)]">
              <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => onChange(screenshots.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-[var(--ink)] text-[var(--on-primary)] rounded-full flex items-center justify-center" aria-label="Remove screenshot">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
