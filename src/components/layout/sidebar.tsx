'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LayoutDashboard, CreditCard, Settings, LogOut, Clock, Trash2, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/activity', label: 'Activity', icon: Clock },
  { href: '/trash', label: 'Trash', icon: Trash2 },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const credits = session?.user?.creditBalance ?? 0

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-[var(--hairline)] bg-[var(--canvas)] h-screen sticky top-0">
      <div className="p-4 border-b border-[var(--hairline)]">
        <Link href="/dashboard" className="text-base font-semibold tracking-[-0.6px]">StoreAssets AI</Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-sm transition-colors ${active ? 'bg-[var(--canvas-soft-2)] font-medium text-[var(--ink)]' : 'text-[var(--body)] hover:bg-[var(--canvas-soft)]'}`}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-[var(--hairline)]">
        <div className={`px-3 py-2 rounded-[var(--radius-pill)] text-xs font-medium text-center mb-3 ${credits > 5 ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : credits > 1 ? 'bg-[var(--warning-soft)] text-[var(--warning-deep)]' : 'bg-[var(--error-soft)] text-[var(--error)]'}`}>
          {credits} credit{credits !== 1 ? 's' : ''} remaining
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--canvas-soft)] text-sm group">
            <Avatar className="h-6 w-6">
              <AvatarImage src={session?.user?.image ?? ''} />
              <AvatarFallback className="text-xs">{session?.user?.name?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
            <span className="truncate text-[var(--body)] flex-1 text-left">{session?.user?.name ?? 'User'}</span>
            <MoreVertical size={16} className="text-[var(--mute)] group-hover:text-[var(--body)] transition-colors" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut size={14} className="mr-2" />Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
