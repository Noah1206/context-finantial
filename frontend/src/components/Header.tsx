'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  nickname?: string
  plan: string
}

interface HeaderProps {
  title: string
  rightContent?: React.ReactNode
}

export default function Header({ title, rightContent }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/news', label: 'News' },
    { href: '/charts', label: 'Charts' },
    { href: '/watchlist', label: 'Watchlist' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <header className="border-b border-white/[0.08] bg-[#0d0d0d]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-[15px] font-medium text-white/90">{title}</h1>
            <nav className="flex gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-[13px] rounded-md transition-all ${
                    pathname === item.href
                      ? 'text-white/90 bg-white/[0.06]'
                      : 'text-white/50 hover:text-white/90 hover:bg-white/[0.06]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {rightContent}

            {!rightContent && (
              <>
                {user ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-white/70">
                        {user.nickname || user.email.split('@')[0]}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded ${
                          user.plan === 'pro'
                            ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                            : 'bg-white/[0.06] text-white/40 border border-white/[0.08]'
                        }`}
                      >
                        {user.plan}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-[13px] text-white/50 hover:text-white/90 hover:bg-white/[0.06] rounded-md transition-all"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/login"
                      className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white/90 hover:bg-white/[0.06] rounded-md transition-all"
                    >
                      Log in
                    </a>
                    <a
                      href="/signup"
                      className="px-3 py-1.5 text-[13px] text-white/90 bg-white/[0.09] hover:bg-white/[0.13] border border-white/[0.08] rounded-md transition-all"
                    >
                      Sign up
                    </a>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
