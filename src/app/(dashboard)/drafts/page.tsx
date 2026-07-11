import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteDraftButton } from '@/components/drafts/delete-draft-button'

export default async function DraftsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const drafts = await prisma.projectDraft.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.96px]">Drafts</h1>
          <p className="text-sm text-[var(--body)] mt-1">Continue working on your saved drafts</p>
        </div>
      </div>

      {drafts.length === 0 ? (
        <Card className="shadow-[var(--shadow-md)] text-center py-16">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-[var(--canvas-soft-2)] mx-auto mb-4 flex items-center justify-center">
              <FileText size={24} className="text-[var(--mute)]" />
            </div>
            <h2 className="text-lg font-semibold tracking-[-0.6px] mb-2">No drafts</h2>
            <p className="text-sm text-[var(--body)] mb-6">Drafts are automatically saved when you create a project.</p>
            <Button asChild className="rounded-[var(--radius-pill)]">
              <Link href="/projects/new">Create New Project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft) => {
            const formData = draft.formData as Record<string, unknown>
            const name = (formData.name as string) || 'Untitled Draft'
            const description = (formData.description as string) || ''
            
            return (
              <Card key={draft.id} className="shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium tracking-[-0.28px] flex items-start justify-between">
                    <span className="flex-1 truncate">{name}</span>
                    <DeleteDraftButton draftId={draft.id} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {description && (
                    <p className="text-sm text-[var(--body)] mb-3 line-clamp-2">{description}</p>
                  )}
                  <p className="text-xs text-[var(--mute)] mb-3">
                    Step {draft.step} of 6 • Updated {new Date(draft.updatedAt).toLocaleDateString()}
                  </p>
                  <Button asChild variant="outline" size="sm" className="rounded-[var(--radius-sm)] w-full">
                    <Link href={`/projects/new?from=${draft.id}`}>Continue</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
