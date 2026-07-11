'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { LanguagesTab } from './languages-tab'

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

export function LanguagesModalTrigger({ projectId, initialLocales }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="rounded-[var(--radius-pill)]">
        <Globe size={14} className="mr-1.5" /> Languages{initialLocales.length > 0 ? ` (${initialLocales.length})` : ''}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold tracking-[-0.6px] mb-4">Manage Languages</h2>
          <LanguagesTab projectId={projectId} initialLocales={initialLocales} />
        </DialogContent>
      </Dialog>
    </>
  )
}
