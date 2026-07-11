import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--hairline)] bg-[var(--canvas)]">
      <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="font-mono text-xs uppercase text-[var(--mute)] mb-3">Product</p>
          <div className="space-y-2">
            <Link href="/pricing" className="block text-sm text-[var(--body)] hover:text-[var(--ink)]">Pricing</Link>
            <Link href="/signup" className="block text-sm text-[var(--body)] hover:text-[var(--ink)]">Get Started</Link>
          </div>
        </div>
        <div>
          <p className="font-mono text-xs uppercase text-[var(--mute)] mb-3">Resources</p>
          <div className="space-y-2">
            <Link href="/#how-it-works" className="block text-sm text-[var(--body)] hover:text-[var(--ink)]">How it Works</Link>
            <Link href="/#faq" className="block text-sm text-[var(--body)] hover:text-[var(--ink)]">FAQ</Link>
          </div>
        </div>
        <div>
          <p className="font-mono text-xs uppercase text-[var(--mute)] mb-3">Legal</p>
          <div className="space-y-2">
            <Link href="#" className="block text-sm text-[var(--body)] hover:text-[var(--ink)]">Privacy</Link>
            <Link href="#" className="block text-sm text-[var(--body)] hover:text-[var(--ink)]">Terms</Link>
          </div>
        </div>
        <div>
          <p className="font-mono text-xs uppercase text-[var(--mute)] mb-3">StoreAssets AI</p>
          <p className="text-sm text-[var(--body)]">Built for developers by a developer.</p>
        </div>
      </div>
      <div className="border-t border-[var(--hairline)] py-4 text-center text-xs text-[var(--mute)]">
        © {new Date().getFullYear()} StoreAssets AI
      </div>
    </footer>
  )
}
