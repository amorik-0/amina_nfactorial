'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  const isGamePage = pathname.startsWith('/play')

  if (isGamePage) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">♟</span>
          <span className="font-bold text-cream group-hover:text-[#e07b54] transition-colors">
            Checkers Duel
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/leaderboard" current={pathname}>
            Leaderboard
          </NavLink>
          <NavLink href="/auth/login" current={pathname}>
            Sign In
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string
  current: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-1.5 rounded-lg text-sm transition-colors',
        current === href
          ? 'text-[#e07b54] bg-[#e07b54]/10'
          : 'text-cream/70 hover:text-cream hover:bg-white/5'
      )}
    >
      {children}
    </Link>
  )
}
