'use client'

import { SessionProvider } from 'next-auth/react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </SessionProvider>
  )
}
