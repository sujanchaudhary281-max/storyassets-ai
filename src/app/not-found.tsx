import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ background: 'conic-gradient(from 230deg at 50% 50%, #0f172a 0deg, #6366f1 72deg, #a855f7 144deg, #ec4899 216deg, #0f172a 288deg, #0f172a 360deg)' }} />
      <div className="relative text-center max-w-sm">
        <p className="text-[100px] font-bold tracking-[-6px] leading-none text-[var(--ink)] opacity-10 select-none">404</p>
        <h1 className="text-xl font-semibold tracking-[-0.6px] mb-2 -mt-4">Page not found</h1>
        <p className="text-sm text-[var(--body)] mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Button asChild className="rounded-[var(--radius-pill)]">
          <Link href="/"><ArrowLeft size={14} className="mr-2" />Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
