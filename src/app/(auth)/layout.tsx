'use client'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-12">
        {children}
      </div>
      <div className="hidden lg:flex items-center justify-center relative overflow-hidden bg-[var(--ink)]">
        <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(135deg, #007cf0 0%, #00dfd8 25%, #7928ca 50%, #ff0080 75%, #f9cb28 100%)' }} />
        <div className="relative z-10 text-center px-12">
          <p className="text-[var(--on-primary)] font-mono text-xs tracking-wide uppercase mb-4 opacity-70">storeassets.ai</p>
          <h2 className="text-[var(--on-primary)] text-3xl font-semibold tracking-[-1.28px] mb-4">Ship your store listing.<br/>Not your weekend.</h2>
          <p className="text-[var(--on-primary)] opacity-70 text-sm">AI-generated App Store & Play Store assets in 90 seconds.</p>
        </div>
      </div>
    </div>
  )
}
