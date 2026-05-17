'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, UserCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '/',        label: 'Home'    },
  { href: '/game',    label: 'Game'    },
  { href: '/tasks',   label: 'Tasks'   },
  { href: '/shop',    label: 'Shop'    },
]

export function Nav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setIsLoggedIn(!!data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isProfileActive = pathname.startsWith('/profile')

  return (
    <nav className="w-full flex items-center justify-center gap-1 px-6 py-3 bg-cream-200">
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'px-4 py-1.5 rounded-pill text-sm font-bold text-brown-900 transition-colors duration-150',
            isActive(href)
              ? 'bg-sage-400'
              : 'hover:bg-sage-200/60'
          )}
        >
          {label}
        </Link>
      ))}

      {/* Account link */}
      <Link
        href={isLoggedIn === false ? '/login' : '/profile'}
        className={cn(
          'ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm font-bold text-brown-900 transition-colors duration-150',
          isProfileActive || pathname === '/login' || pathname === '/register'
            ? 'bg-sage-400'
            : 'hover:bg-sage-200/60'
        )}
      >
        {isLoggedIn === false ? (
          <LogIn
            size={20}
            strokeWidth={1.8}
            className="shrink-0 text-brown-700"
          />
        ) : (
          <UserCircle2
            size={20}
            strokeWidth={1.8}
            className={cn(
              'shrink-0',
              isProfileActive ? 'text-brown-900' : 'text-brown-700'
            )}
          />
        )}
        <span>{isLoggedIn === false ? 'Login' : 'Profile'}</span>
      </Link>
    </nav>
  )
}
