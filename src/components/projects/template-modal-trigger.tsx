'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { TemplateGallery } from './template-gallery'

interface Props {
  projectId: string
  brandColor: string | null
  currentTemplateId: string | null
  iosTemplateId: string | null
  androidTemplateId: string | null
  matchStyleAcross: boolean
  platforms: string[]
}

export function TemplateModalTrigger(props: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="rounded-[var(--radius-pill)]">
        <Palette size={14} className="mr-1.5" /> Template
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold tracking-[-0.6px] mb-4">Choose Template</h2>
          <TemplateGallery {...props} />
        </DialogContent>
      </Dialog>
    </>
  )
}
