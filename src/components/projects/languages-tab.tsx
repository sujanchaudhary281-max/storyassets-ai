'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SUPPORTED_LOCALES, getLocalesByGroup } from '@/lib/locales'
import { Globe, Loader2, Trash2 } from 'lucide-react'

interface ProjectLocale {
  id: string
  locale: string
  translationMode: string
  status: string
  _count?: { localizedAssets: number }
}

interface Props {
  projectId: string
  initialLocales: ProjectLocale[]
}

export function LanguagesTab({ projectId, initialLocales }: Props) {
  const [locales, setLocales] = useState<ProjectLocale[]>(initialLocales)
  const [adding, setAdding] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [translating, setTranslating] = useState<string | null>(null)

  const groups = getLocalesByGroup()

  async function addLocales() {
    if (selected.length === 0) return
    setAdding(true)
    const res = await fetch(`/api/projects/${projectId}/locales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locales: selected }),
    })
    const json = await res.json()
    if (json.success) {
      setLocales(json.data.locales)
      setSelected([])
      setShowPicker(false)
    }
    setAdding(false)
  }

  async function removeLocale(localeId: string) {
    await fetch(`/api/projects/${projectId}/locales`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localeId }),
    })
    setLocales(l => l.filter(x => x.id !== localeId))
  }

  async function translateLocale(localeId: string) {
    setTranslating(localeId)
    await fetch(`/api/projects/${projectId}/locales/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localeId }),
    })
    // Refresh locales
    const res = await fetch(`/api/projects/${projectId}/locales`)
    const json = await res.json()
    if (json.success) setLocales(json.data.locales)
    setTranslating(null)
  }

  const existingCodes = locales.map(l => l.locale)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Globe size={16} /> Languages ({locales.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowPicker(!showPicker)} className="text-xs">
          {showPicker ? 'Cancel' : '+ Add Languages'}
        </Button>
      </div>

      {/* Locale picker */}
      {showPicker && (
        <div className="border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 space-y-3 max-h-80 overflow-y-auto">
          {Array.from(groups.entries()).map(([group, locs]) => (
            <div key={group}>
              <p className="text-xs font-medium text-[var(--mute)] mb-1">{group}</p>
              <div className="flex flex-wrap gap-1">
                {locs.filter(l => !existingCodes.includes(l.code)).map(l => (
                  <label key={l.code} className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded cursor-pointer transition-colors ${selected.includes(l.code) ? 'bg-[var(--link)] text-white border-[var(--link)]' : 'border-[var(--hairline)] hover:border-[var(--link)]'}`}>
                    <input type="checkbox" className="sr-only" checked={selected.includes(l.code)} onChange={e => setSelected(s => e.target.checked ? [...s, l.code] : s.filter(x => x !== l.code))} />
                    {l.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <Button size="sm" onClick={addLocales} disabled={adding || selected.length === 0} className="text-xs">
            {adding ? 'Adding...' : `Add ${selected.length} locale(s)`}
          </Button>
        </div>
      )}

      {/* Active locales */}
      <div className="space-y-2">
        {locales.map(l => {
          const info = SUPPORTED_LOCALES.find(s => s.code === l.locale)
          return (
            <div key={l.id} className="flex items-center justify-between p-3 border border-[var(--hairline)] rounded-[var(--radius-sm)]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{info?.name ?? l.locale}</span>
                <span className="text-xs text-[var(--mute)]">{l.locale}</span>
                <Badge variant={l.status === 'approved' ? 'default' : l.status === 'translated' ? 'secondary' : 'outline'} className="text-[10px]">
                  {l.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {l.status === 'draft' && (
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => translateLocale(l.id)} disabled={translating === l.id}>
                    {translating === l.id ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                    AI Translate
                  </Button>
                )}
                {l.status === 'translated' && (
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <a href={`/projects/${projectId}/locales/${l.id}/review`}>Review</a>
                  </Button>
                )}
                <button onClick={() => removeLocale(l.id)} className="text-[var(--mute)] hover:text-[var(--error)]" aria-label="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
        {locales.length === 0 && <p className="text-sm text-[var(--mute)]">No languages added yet.</p>}
      </div>
    </div>
  )
}
