'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { GeneratedAsset } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, RotateCcw, Sparkles, Copy, Undo2, Redo2 } from 'lucide-react'
import Link from 'next/link'
import { checkContentPolicy } from '@/lib/content-policy'
import { toast } from '@/lib/toast'

interface EditorState {
  background: { type: 'color' | 'gradient'; value: string; gradientEnd?: string }
  headline: { text: string; fontSize: number; color: string; y: number }
  subtext: { text: string; fontSize: number; color: string; y: number }
  deviceFrame: { visible: boolean; color: string; radius: number }
  uiImage: { offsetX: number; offsetY: number; scale: number }
}

interface Props {
  asset: GeneratedAsset & { job: { project: { name: string; brandColor: string | null; stylePreset: string }; id: string } }
  projectId: string
}

export function ScreenshotEditor({ asset, projectId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [saving, setSaving] = useState(false)

  // Initial state
  const initialState: EditorState = {
    background: {
      type: 'color',
      value: asset.job.project.brandColor ?? (
        asset.job.project.stylePreset === 'dark' ? '#171717' :
          asset.job.project.stylePreset === 'gradient' ? '#007cf0' :
            asset.job.project.stylePreset === 'vibrant' ? '#ff0080' : '#f5f5f5'
      )
    },
    headline: {
      text: asset.captionHeadline ?? '',
      fontSize: Math.round(asset.width * 0.036),
      color: asset.job.project.stylePreset === 'minimal' ? '#171717' : '#ffffff',
      y: 0.08
    },
    subtext: {
      text: asset.captionSubtext ?? '',
      fontSize: Math.round(asset.width * 0.023),
      color: asset.job.project.stylePreset === 'minimal' ? '#171717' : '#ffffff',
      y: 0.12
    },
    deviceFrame: { visible: true, color: '#00000020', radius: 24 },
    uiImage: { offsetX: 0, offsetY: 0, scale: 1 },
  }

  const [state, setState] = useState<EditorState>(initialState)

  // History management
  const [history, setHistory] = useState<EditorState[]>([initialState])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Add state to history when it changes
  const updateState = useCallback((newState: EditorState | ((prev: EditorState) => EditorState)) => {
    setState(prevState => {
      const nextState = typeof newState === 'function' ? newState(prevState) : newState

      // Only add to history if state actually changed
      const stateChanged = JSON.stringify(prevState) !== JSON.stringify(nextState)
      if (stateChanged) {
        setHistory(prevHistory => {
          // Remove any forward history if we're not at the end
          const newHistory = prevHistory.slice(0, historyIndex + 1)
          // Add new state
          newHistory.push(nextState)
          // Limit history to 50 states to prevent memory issues
          if (newHistory.length > 50) {
            newHistory.shift()
            setHistoryIndex(prev => prev) // Keep index the same since we removed from start
            return newHistory
          }
          setHistoryIndex(newHistory.length - 1)
          return newHistory
        })
      }

      return nextState
    })
  }, [historyIndex])

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setState(history[newIndex])
    }
  }, [historyIndex, history])

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setState(history[newIndex])
    }
  }, [historyIndex, history])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = asset
    canvas.width = width
    canvas.height = height

    // Background layer
    if (state.background.type === 'gradient' && state.background.gradientEnd) {
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, state.background.value)
      grad.addColorStop(1, state.background.gradientEnd)
      ctx.fillStyle = grad
    } else {
      ctx.fillStyle = state.background.value
    }
    ctx.fillRect(0, 0, width, height)

    // Device frame layer
    if (state.deviceFrame.visible) {
      const fx = width * 0.1
      const fy = height * 0.18
      const fw = width * 0.8
      const fh = height * 0.75
      ctx.fillStyle = state.deviceFrame.color
      ctx.beginPath()
      ctx.roundRect(fx, fy, fw, fh, state.deviceFrame.radius)
      ctx.fill()
    }

    // Headline text layer
    ctx.fillStyle = state.headline.color
    ctx.font = `bold ${state.headline.fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(state.headline.text, width / 2, height * state.headline.y)

    // Subtext layer
    ctx.fillStyle = state.subtext.color
    ctx.font = `${state.subtext.fontSize}px sans-serif`
    ctx.globalAlpha = 0.8
    ctx.fillText(state.subtext.text, width / 2, height * state.subtext.y)
    ctx.globalAlpha = 1
  }, [asset, state])

  useEffect(() => { render() }, [render])

  async function handleSave() {
    const canvas = canvasRef.current
    if (!canvas) return
    setSaving(true)
    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Failed to export canvas')

      const formData = new FormData()
      formData.append('file', blob, 'screenshot.png')
      formData.append('headline', state.headline.text)
      formData.append('subtext', state.subtext.text)

      const res = await fetch(`/api/projects/${projectId}/screenshots/${asset.id}/save`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Save failed')
      }

      toast.success('Screenshot saved', 'Your changes have been saved successfully.')
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Save failed', err instanceof Error ? err.message : 'Failed to save screenshot')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* Canvas area */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--canvas-soft)] p-4 overflow-auto">
        <div className="mb-3 flex items-center gap-2">
          <Link href={`/projects/${projectId}`} className="text-sm text-[var(--link)] flex items-center gap-1">
            <ArrowLeft size={14} /> Back to results
          </Link>
          <span className="text-xs text-[var(--mute)]">·</span>
          <span className="text-xs text-[var(--mute)]">{asset.width}×{asset.height} · {asset.deviceSize}</span>
        </div>
        <canvas
          ref={canvasRef}
          className="border border-[var(--hairline)] rounded shadow-lg"
          style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 12rem)', width: 'auto', height: 'auto' }}
        />
      </div>

      {/* Layer panel */}
      <div className="w-80 border-l border-[var(--hairline)] bg-[var(--canvas)] overflow-y-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Layers</h2>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={undo}
              disabled={historyIndex === 0}
              title="Undo (Ctrl+Z)"
              className="h-8 w-8 p-0"
            >
              <Undo2 size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              title="Redo (Ctrl+Y)"
              className="h-8 w-8 p-0"
            >
              <Redo2 size={14} />
            </Button>
            <Button size="sm" variant="outline" onClick={handleSave} disabled={saving}>
              <Save size={14} className="mr-1" /> {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Background layer */}
        <LayerSection title="Background">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs w-12">Color</Label>
              <Input type="color" value={state.background.value} onChange={e => updateState(s => ({ ...s, background: { ...s.background, value: e.target.value } }))} className="w-10 h-8 p-0.5" />
              <Input type="text" value={state.background.value} onChange={e => updateState(s => ({ ...s, background: { ...s.background, value: e.target.value } }))} className="flex-1 text-xs h-8" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs w-12">Type</Label>
              <select value={state.background.type} onChange={e => updateState(s => ({ ...s, background: { ...s.background, type: e.target.value as 'color' | 'gradient' } }))} className="flex-1 text-xs h-8 border border-[var(--hairline)] rounded px-2 bg-[var(--canvas)]">
                <option value="color">Solid</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>
            {state.background.type === 'gradient' && (
              <div className="flex items-center gap-2">
                <Label className="text-xs w-12">End</Label>
                <Input type="color" value={state.background.gradientEnd ?? '#000000'} onChange={e => updateState(s => ({ ...s, background: { ...s.background, gradientEnd: e.target.value } }))} className="w-10 h-8 p-0.5" />
              </div>
            )}
          </div>
        </LayerSection>

        {/* Headline layer */}
        <LayerSection title="Headline">
          <div className="space-y-2">
            <Input value={state.headline.text} onChange={e => updateState(s => ({ ...s, headline: { ...s.headline, text: e.target.value } }))} className="text-xs h-8" placeholder="Headline text" />
            <div className="flex gap-2">
              <div className="flex items-center gap-1 flex-1">
                <Label className="text-xs">Size</Label>
                <Input type="number" value={state.headline.fontSize} onChange={e => updateState(s => ({ ...s, headline: { ...s.headline, fontSize: +e.target.value } }))} className="text-xs h-8 w-16" />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs">Color</Label>
                <Input type="color" value={state.headline.color} onChange={e => updateState(s => ({ ...s, headline: { ...s.headline, color: e.target.value } }))} className="w-8 h-8 p-0.5" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs w-16">Position Y</Label>
              <input type="range" min="0.02" max="0.5" step="0.01" value={state.headline.y} onChange={e => updateState(s => ({ ...s, headline: { ...s.headline, y: +e.target.value } }))} className="flex-1" />
            </div>
          </div>
        </LayerSection>

        {/* Subtext layer */}
        <LayerSection title="Subtext">
          <div className="space-y-2">
            <Input value={state.subtext.text} onChange={e => updateState(s => ({ ...s, subtext: { ...s.subtext, text: e.target.value } }))} className="text-xs h-8" placeholder="Subtext" />
            <div className="flex gap-2">
              <div className="flex items-center gap-1 flex-1">
                <Label className="text-xs">Size</Label>
                <Input type="number" value={state.subtext.fontSize} onChange={e => updateState(s => ({ ...s, subtext: { ...s.subtext, fontSize: +e.target.value } }))} className="text-xs h-8 w-16" />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs">Color</Label>
                <Input type="color" value={state.subtext.color} onChange={e => updateState(s => ({ ...s, subtext: { ...s.subtext, color: e.target.value } }))} className="w-8 h-8 p-0.5" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs w-16">Position Y</Label>
              <input type="range" min="0.02" max="0.5" step="0.01" value={state.subtext.y} onChange={e => updateState(s => ({ ...s, subtext: { ...s.subtext, y: +e.target.value } }))} className="flex-1" />
            </div>
          </div>
        </LayerSection>

        {/* Device frame layer */}
        <LayerSection title="Device Frame">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={state.deviceFrame.visible} onChange={e => updateState(s => ({ ...s, deviceFrame: { ...s.deviceFrame, visible: e.target.checked } }))} />
              Show frame
            </label>
            <div className="flex items-center gap-2">
              <Label className="text-xs w-12">Color</Label>
              <Input type="color" value={state.deviceFrame.color.replace(/[0-9a-f]{2}$/i, '')} onChange={e => updateState(s => ({ ...s, deviceFrame: { ...s.deviceFrame, color: e.target.value + '33' } }))} className="w-10 h-8 p-0.5" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs w-12">Radius</Label>
              <input type="range" min="0" max="48" value={state.deviceFrame.radius} onChange={e => updateState(s => ({ ...s, deviceFrame: { ...s.deviceFrame, radius: +e.target.value } }))} className="flex-1" />
            </div>
          </div>
        </LayerSection>

        {/* Content Policy Warnings */}
        {(() => {
          const hw = checkContentPolicy(state.headline.text)
          const sw = checkContentPolicy(state.subtext.text)
          const all = [...hw.warnings, ...sw.warnings]
          if (all.length === 0) return null
          return (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-sm)]">
              <p className="text-xs font-medium text-amber-700 mb-1">⚠ Content Policy</p>
              {all.map((w, i) => <p key={i} className="text-[10px] text-amber-600">{w}</p>)}
            </div>
          )
        })()}

        {/* Actions */}
        <div className="border-t border-[var(--hairline)] pt-4 space-y-2">
          <RegenerateButton projectId={projectId} assetId={asset.id} />
          <Button variant="outline" className="w-full text-xs" onClick={async () => {
            await fetch(`/api/projects/${projectId}/screenshots/${asset.id}/apply-all`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ headline: state.headline, subtext: state.subtext, background: state.background }) })
          }}>
            <Copy size={14} className="mr-1" /> Apply to All Sizes
          </Button>
        </div>

        {/* Version History */}
        <VersionHistory projectId={projectId} assetId={asset.id} />
      </div>
    </div>
  )
}

function RegenerateButton({ projectId, assetId }: { projectId: string; assetId: string }) {
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegenerate() {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/screenshots/${assetId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: instruction || undefined }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Regeneration failed')
      }

      toast.success('Regenerating...', 'Your screenshot is being regenerated.')
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Regeneration error:', error)
      toast.error('Regeneration failed', error instanceof Error ? error.message : 'Failed to regenerate screenshot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <Input value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="Optional: refinement instruction..." className="text-xs h-7" />
      <Button variant="outline" className="w-full text-xs" onClick={handleRegenerate} disabled={loading}>
        <Sparkles size={14} className="mr-1" /> {loading ? 'Regenerating...' : 'Regenerate with AI'}
      </Button>
    </div>
  )
}

function VersionHistory({ projectId, assetId }: { projectId: string; assetId: string }) {
  const [versions, setVersions] = useState<Array<{ id: string; createdAt: string; versionNote: string | null; storageKey: string }>>([])
  const [loaded, setLoaded] = useState(false)

  async function loadVersions() {
    const res = await fetch(`/api/projects/${projectId}/screenshots/${assetId}/versions`)
    const json = await res.json()
    if (json.success) setVersions(json.data.versions)
    setLoaded(true)
  }

  async function revert(versionId: string) {
    if (!confirm('Revert to this version? Current state will be saved as a version.')) return
    await fetch(`/api/projects/${projectId}/screenshots/${assetId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId }),
    })
    window.location.reload()
  }

  return (
    <div className="border-t border-[var(--hairline)] pt-4">
      <button onClick={loadVersions} className="text-xs font-medium text-[var(--link)] flex items-center gap-1">
        <RotateCcw size={12} /> {loaded ? 'Refresh' : 'Show'} Version History
      </button>
      {loaded && (
        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
          {versions.length === 0 && <p className="text-xs text-[var(--mute)]">No prior versions.</p>}
          {versions.map(v => (
            <div key={v.id} className="flex items-center justify-between p-2 border border-[var(--hairline)] rounded text-xs">
              <div>
                <p className="text-[var(--body)]">{v.versionNote ?? 'Version'}</p>
                <p className="text-[var(--mute)]">{new Date(v.createdAt).toLocaleString()}</p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs h-6" onClick={() => revert(v.id)}>
                Revert
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LayerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--hairline)] rounded-[var(--radius-sm)] p-3">
      <h3 className="text-xs font-medium mb-2 text-[var(--body)]">{title}</h3>
      {children}
    </div>
  )
}
