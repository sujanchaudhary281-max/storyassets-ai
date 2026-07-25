'use client'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--canvas)]">
      <div className="flex items-center justify-center p-6 lg:p-12">
        {children}
      </div>
      <div className="hidden lg:flex items-center justify-center relative overflow-hidden bg-neutral-950 border-l border-[var(--hairline)]">
        <div className="relative z-10 text-center px-12 max-w-md">
          <p className="text-zinc-400 font-mono text-xs tracking-wide uppercase mb-4">storeassets.ai</p>
          <h2 className="text-white text-3xl font-semibold tracking-[-1.28px] mb-4 leading-tight">Ship your store listing.<br/>Not your weekend.</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">AI-generated App Store & Play Store assets in 90 seconds.</p>
        </div>
      </div>
    </div>
  )
}

