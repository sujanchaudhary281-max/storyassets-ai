'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { projectSchema, APP_CATEGORIES, STYLE_PRESETS } from '@/lib/validations'
import { SUPPORTED_LOCALES, getLocalesByGroup } from '@/lib/locales'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ScreenshotUploader } from '@/components/projects/screenshot-uploader'
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react'

type FormData = z.infer<typeof projectSchema>

interface Template {
  id: string
  name: string
  category: string
  config: string
  isDefault: boolean
}

const TOTAL_STEPS = 6

const styleCards: Record<string, { label: string; desc: string; color: string }> = {
  minimal: { label: 'Minimal', desc: 'Clean whites, subtle shadows', color: '#fafafa' },
  gradient: { label: 'Gradient', desc: 'Vibrant color transitions', color: '#007cf0' },
  dark: { label: 'Dark', desc: 'Deep darks, high contrast', color: '#171717' },
  vibrant: { label: 'Vibrant', desc: 'Bold, saturated colors', color: '#ff0080' },
}

function NewProjectPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('from')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [screenshots, setScreenshots] = useState<string[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedLocales, setSelectedLocales] = useState<string[]>([])
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [iconUrl, setIconUrl] = useState<string>('')
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const { register, handleSubmit, setValue, watch, trigger, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { platforms: ['ios'], stylePreset: 'minimal', ageGroup: 'all-ages' },
  })

  const platforms = watch('platforms')
  const stylePreset = watch('stylePreset')
  const description = watch('description') ?? ''
  const templateId = watch('templateId')
  const brandColor = watch('brandColor')
  const ageGroup = watch('ageGroup')

  // Load draft data if coming from Copy Project
  useEffect(() => {
    if (draftId) {
      fetch(`/api/drafts/${draftId}`)
        .then(r => r.json())
        .then(json => {
          if (json.data?.formData) {
            reset(json.data.formData as FormData)
            setStep(json.data.step || 1)
          }
        })
        .catch(err => console.error('Failed to load draft:', err))
    }
  }, [draftId, reset])

  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(json => {
      if (json.data) setTemplates(json.data)
    })
  }, [])

  // Auto-save draft every 10 seconds
  // NOTE: Use individual watched values as deps, NOT watch() which returns a new object every render
  const watchedName = watch('name')
  const watchedDescription = watch('description')

  useEffect(() => {
    const hasData = watchedName || watchedDescription
    if (!hasData) return

    const timer = setTimeout(async () => {
      try {
        const method = currentDraftId ? 'PUT' : 'POST'
        const url = currentDraftId ? `/api/drafts/${currentDraftId}` : '/api/drafts'

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData: watch(),
            step,
          }),
        })

        const json = await res.json()
        if (res.ok && json.data?.id) {
          setCurrentDraftId(json.data.id)
          setLastSaved(new Date())
        }
      } catch (err) {
        console.error('Auto-save failed:', err)
      }
    }, 10000) // 10 seconds

    return () => clearTimeout(timer)
  }, [watchedName, watchedDescription, step, currentDraftId])

  const groups = getLocalesByGroup()

  async function saveDraft() {
    try {
      setLoading(true)
      const method = currentDraftId ? 'PUT' : 'POST'
      const url = currentDraftId ? `/api/drafts/${currentDraftId}` : '/api/drafts'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: watch(),
          step,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      router.push('/drafts')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  async function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingIcon(true)
      const formData = new FormData()
      formData.append('file', file)
      console.log([...formData], "Hahahah")
      const res = await fetch('/api/upload/icon', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Upload failed')
      }

      setValue('iconKey', json.data.key)
      setIconUrl(json.data.url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload icon')
    } finally {
      setUploadingIcon(false)
    }
  }

  async function nextStep() {
    if (step === 1) {
      const valid = await trigger(['name', 'description', 'ageGroup', 'category'])
      if (valid) setStep(2)
    } else if (step === 2) {
      const valid = await trigger(['platforms', 'stylePreset'])
      if (valid) setStep(3)
    } else {
      setStep(step + 1)
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const payload = { ...data, locales: selectedLocales.length > 0 ? selectedLocales : undefined }
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      router.push(`/projects/${json.data.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-[-0.96px] mb-2">Create new project</h1>
      <p className="text-sm text-[var(--body)] mb-6">Describe your app and we'll generate all your store assets.</p>

      {/* Progress bar */}
      <div className="flex gap-1 mb-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[var(--ink)]' : 'bg-[var(--hairline)]'}`} />
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Step 1: App Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm">App Name</Label>
              <Input {...register('name')} className="mt-1 h-10 rounded-[var(--radius-sm)]" placeholder="My Awesome App" maxLength={100} />
              {errors.name && <p className="text-xs text-[var(--error)] mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label className="text-sm">Description (5000 words max)</Label>
              <Textarea {...register('description')} className="mt-1 min-h-[180px] rounded-[var(--radius-sm)]" placeholder="Describe your app's features, target users, and what makes it unique..." />
              <p className="text-xs text-[var(--mute)] mt-1">{description.trim().split(/\s+/).filter(Boolean).length} words</p>
              {errors.description && <p className="text-xs text-[var(--error)] mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label className="text-sm">Age Group</Label>
              <select {...register('ageGroup')} className="mt-1 h-10 w-full rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--canvas)] px-3 text-sm">
                <option value="all-ages">All ages</option>
                <option value="4+">4+</option>
                <option value="9+">9+</option>
                <option value="12+">12+</option>
                <option value="17+">17+</option>
                <option value="25+">25+</option>
              </select>
              {errors.ageGroup && <p className="text-xs text-[var(--error)] mt-1">{errors.ageGroup.message}</p>}
            </div>
            <div>
              <Label className="text-sm">Category</Label>
              <select {...register('category')} className="mt-1 h-10 w-full rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--canvas)] px-3 text-sm">
                <option value="">Select category</option>
                {APP_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
              {errors.category && <p className="text-xs text-[var(--error)] mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <Label className="text-sm">App Icon (optional, recommended)</Label>
              <p className="text-xs text-[var(--body)] mb-2">Upload your app icon for better branded screenshots</p>
              <Input
                type="file"
                accept="image/png,image/jpeg"
                className="mt-1 h-10 rounded-[var(--radius-sm)]"
                onChange={handleIconUpload}
                disabled={uploadingIcon}
              />
              {uploadingIcon && <p className="text-xs text-[var(--mute)] mt-1">Uploading...</p>}
              {iconUrl && !uploadingIcon && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={iconUrl} alt="App icon" className="w-12 h-12 rounded-lg object-cover" />
                  <p className="text-xs text-green-600">✓ Icon uploaded</p>
                </div>
              )}
              {errors.iconKey && <p className="text-xs text-[var(--error)] mt-1">{errors.iconKey.message}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Platforms & Style */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm mb-3 block">Platforms</Label>
              <div className="flex gap-3">
                {(['ios', 'android'] as const).map(p => {
                  const selected = platforms?.includes(p)
                  return (
                    <button key={p} type="button" onClick={() => {
                      const current = platforms ?? []
                      const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p]
                      if (next.length > 0) setValue('platforms', next as ('ios' | 'android')[])
                    }} className={`relative flex-1 flex items-center gap-3 px-4 py-5 rounded-xl border-2 transition-all ${selected ? 'border-[var(--link)] bg-[var(--link)]/5 shadow-sm' : 'border-[var(--hairline)] bg-[var(--canvas)] hover:border-[var(--hairline-strong)]'}`}>
                      <span className="text-2xl">{p === 'ios' ? '🍎' : '🤖'}</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{p === 'ios' ? 'iOS' : 'Android'}</p>
                        <p className="text-xs text-[var(--mute)]">{p === 'ios' ? 'App Store' : 'Google Play'}</p>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--link)] flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              {errors.platforms && <p className="text-xs text-[var(--error)] mt-1">{errors.platforms.message}</p>}
            </div>
            <div>
              <Label className="text-sm mb-3 block">Style Preset</Label>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_PRESETS.map(s => (
                  <button key={s} type="button" onClick={() => setValue('stylePreset', s)} className={`p-4 rounded-[var(--radius-md)] border text-left transition-all ${stylePreset === s ? 'border-[var(--ink)]' : 'border-[var(--hairline)]'}`}>
                    <div className="w-8 h-8 rounded-full mb-2" style={{ background: styleCards[s].color }} />
                    <p className="text-sm font-medium">{styleCards[s].label}</p>
                    <p className="text-xs text-[var(--mute)]">{styleCards[s].desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm">Brand Color (optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input {...register('brandColor')} className="h-10 rounded-[var(--radius-sm)] flex-1" placeholder="#4F46E5" />
                <input type="color" className="h-10 w-10 rounded-[var(--radius-sm)] border border-[var(--hairline)] cursor-pointer" onChange={e => setValue('brandColor', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Screenshots */}
        {step === 3 && (
          <div>
            <Label className="text-sm mb-2 block">Screenshots (optional)</Label>
            <p className="text-xs text-[var(--body)] mb-4">Upload raw screenshots from your device. We'll add device frames, captions, and branding automatically.</p>
            <ScreenshotUploader screenshots={screenshots} onChange={setScreenshots} />
            <p className="text-xs text-[var(--mute)] mt-3">Or skip this step — we'll generate placeholder screens from your description.</p>
          </div>
        )}

        {/* Step 4: Template Selection */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">Choose a Template (optional)</Label>
              <p className="text-xs text-[var(--body)] mb-4">Pick a layout style for your screenshots. You can change this later.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {templates.map(t => {
                const config = JSON.parse(t.config)
                const isActive = t.id === templateId
                const previewBg = brandColor || config.bgColor
                return (
                  <button key={t.id} type="button" onClick={() => setValue('templateId', isActive ? undefined : t.id)} className={`relative text-left border rounded-[var(--radius-md)] overflow-hidden transition-all hover:shadow-md ${isActive ? 'ring-2 ring-[var(--link)] border-[var(--link)]' : 'border-[var(--hairline)]'}`}>
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
            {templates.length === 0 && <p className="text-sm text-[var(--mute)]">No templates available.</p>}
          </div>
        )}

        {/* Step 5: Language Selection */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">Languages (optional)</Label>
              <p className="text-xs text-[var(--body)] mb-4">Select languages to localize your store assets into. You can add more later.</p>
            </div>
            <div className="border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 space-y-3 max-h-80 overflow-y-auto">
              {Array.from(groups.entries()).map(([group, locs]) => (
                <div key={group}>
                  <p className="text-xs font-medium text-[var(--mute)] mb-1">{group}</p>
                  <div className="flex flex-wrap gap-1">
                    {locs.map(l => (
                      <label key={l.code} className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded cursor-pointer transition-colors ${selectedLocales.includes(l.code) ? 'bg-[var(--link)] text-white border-[var(--link)]' : 'border-[var(--hairline)] hover:border-[var(--link)]'}`}>
                        <input type="checkbox" className="sr-only" checked={selectedLocales.includes(l.code)} onChange={e => setSelectedLocales(s => e.target.checked ? [...s, l.code] : s.filter(x => x !== l.code))} />
                        {l.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {selectedLocales.length > 0 && (
              <p className="text-xs text-[var(--body)]">{selectedLocales.length} language(s) selected</p>
            )}
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <Card className="shadow-[var(--shadow-md)]">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold tracking-[-0.6px]">Review & Generate</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-[var(--mute)]">App:</span> {watch('name')}</p>
                <p><span className="text-[var(--mute)]">Category:</span> {watch('category')}</p>
                <p><span className="text-[var(--mute)]">Platforms:</span> {platforms?.join(', ')}</p>
                <p><span className="text-[var(--mute)]">Style:</span> {stylePreset}</p>
                <p><span className="text-[var(--mute)]">Screenshots:</span> {screenshots.length || 'None (will generate placeholders)'}</p>
                <p><span className="text-[var(--mute)]">Template:</span> {templateId ? templates.find(t => t.id === templateId)?.name ?? 'Selected' : 'Default'}</p>
                <p><span className="text-[var(--mute)]">Languages:</span> {selectedLocales.length > 0 ? selectedLocales.map(c => SUPPORTED_LOCALES.find(l => l.code === c)?.name ?? c).join(', ') : 'None'}</p>
              </div>
              <div className="bg-[var(--canvas-soft)] rounded-[var(--radius-sm)] p-3">
                <p className="text-sm font-medium">1 credit will be used</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center mt-8">
          <div className="flex items-center gap-3">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="rounded-[var(--radius-pill)]">
                <ArrowLeft size={16} className="mr-2" />Back
              </Button>
            ) : <div />}

            {/* Auto-save indicator */}
            {lastSaved && (
              <span className="text-xs text-[var(--mute)]">
                Saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Save Draft button */}
            {step < TOTAL_STEPS && (
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                disabled={loading}
                className="rounded-[var(--radius-pill)]"
              >
                Save Draft
              </Button>
            )}

            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={nextStep} className="rounded-[var(--radius-pill)]">
                {step === TOTAL_STEPS - 1 ? 'Review' : 'Next'}<ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={loading}
                onClick={handleSubmit(onSubmit)}
                className="rounded-[var(--radius-pill)]"
              >
                <Sparkles size={16} className="mr-2" />{loading ? 'Generating...' : 'Generate screenshots'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <NewProjectPageContent />
    </Suspense>
  )
}
