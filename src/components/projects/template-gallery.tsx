'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

interface Template {
  id: string
  name: string
  category: string
  config: string
  isDefault: boolean
}

interface Props {
  projectId: string
  brandColor: string | null
  currentTemplateId: string | null
  iosTemplateId: string | null
  androidTemplateId: string | null
  matchStyleAcross: boolean
  platforms: string[]
}

export function TemplateGallery({ projectId, brandColor, currentTemplateId, iosTemplateId, androidTemplateId, platforms }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [activePlatform, setActivePlatform] = useState<'all' | 'ios' | 'android'>('all')
  const [selectedIds, setSelectedIds] = useState<Record<string, string | null>>({
    all: currentTemplateId,
    ios: iosTemplateId,
    android: androidTemplateId,
  })

  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(json => {
      if (json.data) setTemplates(json.data)
    })
  }, [])

  async function selectTemplate(templateId: string) {
    setSelectedIds(prev => ({ ...prev, [activePlatform]: templateId }))
    await fetch(`/api/projects/${projectId}/template`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, platform: activePlatform, matchStyleAcross: activePlatform === 'all' }),
    })
  }

  const activeId = selectedIds[activePlatform]

  return (
    <div className="space-y-4">
      {/* Platform filter - pill style */}
      {platforms.length > 1 && (
        <div className="inline-flex rounded-full border border-[var(--hairline)] p-0.5 bg-[var(--canvas-soft)]">
          {(['all', ...platforms] as const).map(p => (
            <button
              key={p}
              onClick={() => setActivePlatform(p as typeof activePlatform)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${activePlatform === p ? 'bg-[var(--ink)] text-[var(--on-primary)] shadow-sm' : 'text-[var(--body)] hover:text-[var(--ink)]'}`}
            >
              {p === 'all' ? 'Both' : p === 'ios' ? 'iOS' : 'Android'}
            </button>
          ))}
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {templates.map(t => {
          const config = JSON.parse(t.config)
          const isActive = t.id === activeId
          const previewBg = brandColor ?? config.bgColor
          return (
            <button
              key={t.id}
              onClick={() => selectTemplate(t.id)}
              className={`relative text-left border rounded-[var(--radius-md)] overflow-hidden transition-all hover:shadow-md ${isActive ? 'ring-2 ring-[var(--link)] border-[var(--link)]' : 'border-[var(--hairline)]'}`}
            >
              <div className="aspect-[9/16] relative" style={{ background: config.bgGradientEnd ? `linear-gradient(to bottom, ${previewBg}, ${config.bgGradientEnd})` : previewBg }}>
                <div className="absolute inset-x-0 top-[8%] text-center px-3">
                  <p className="text-[10px] truncate" style={{ color: config.textColor, fontWeight: config.fontWeight === 'bold' ? 700 : 400 }}>Your App Headline</p>
                  <p className="text-[8px] mt-0.5 opacity-80" style={{ color: config.subtextColor }}>Subtext preview</p>
                </div>
                {config.frameVisible && (
                  <div className="absolute left-[10%] top-[18%] w-[80%] h-[75%]" style={{ background: config.frameBg, borderRadius: config.frameRadius * 0.3 }} />
                )}
              </div>
              <div className="p-2 border-t border-[var(--hairline)] bg-[var(--canvas)]">
                <p className="text-xs font-medium">{t.name}</p>
                <p className="text-[10px] text-[var(--mute)]">{t.category}</p>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--link)] rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
