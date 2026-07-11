'use client'

import { SessionProvider } from 'next-auth/react'
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-[#fafafa] via-[#fafafa] to-[#f0f4f8]">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-[1200px]">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
