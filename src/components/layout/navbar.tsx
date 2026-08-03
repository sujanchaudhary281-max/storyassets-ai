'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-[var(--hairline)] bg-[var(--canvas)]/80 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-6">
        <Link href="/" className="text-base font-semibold tracking-[-0.6px]">StoreAssets AI</Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#how-it-works" className="text-sm text-[var(--body)] hover:text-[var(--ink)] transition-colors">How it works</Link>
          <Link href="/pricing" className="text-sm text-[var(--body)] hover:text-[var(--ink)] transition-colors">Pricing</Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <Button asChild size="sm" className="rounded-[var(--radius-sm)] h-7 px-3 text-sm font-medium">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm" className="rounded-[var(--radius-sm)] h-7 px-3 text-sm font-medium">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-[var(--radius-sm)] h-7 px-3 text-sm font-medium">
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-[var(--canvas)] border-b border-[var(--hairline)] p-4 space-y-3">
          <Link href="/#how-it-works" className="block text-sm text-[var(--body)]" onClick={() => setOpen(false)}>How it works</Link>
          <Link href="/pricing" className="block text-sm text-[var(--body)]" onClick={() => setOpen(false)}>Pricing</Link>
          {session ? (
            <Link href="/dashboard" className="block text-sm font-medium" onClick={() => setOpen(false)}>Dashboard</Link>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" asChild size="sm"><Link href="/login">Log in</Link></Button>
              <Button asChild size="sm" className='cursor-pointer rounded-md'><Link href="/signup">Get Started</Link></Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
