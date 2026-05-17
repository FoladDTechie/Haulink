'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-browser'

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line backdrop-blur"
      style={{ background: 'rgba(251,249,244,0.78)' }}>
      <div className="max-w-[1240px] mx-auto px-8 flex items-center justify-between h-[72px]">
        <Link href="/" className="flex items-baseline font-serif-display font-medium text-[26px] tracking-[-0.02em]">
          <span className="w-2.5 h-2.5 rounded-full bg-green-brand mr-3 self-center"
            style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.16)' }} />
          Hau<em className="font-serif-italic text-green-deep">link</em>
        </Link>
        <nav className="hidden md:flex gap-9 items-center">
          {[
            { l: 'How it works', href: '/#how' },
            { l: 'Pricing',      href: '/#pricing' },
            { l: 'Track',        href: '/track' },
            { l: 'About',        href: '#' },
          ].map((it) => (
            <Link key={it.l} href={it.href} className="text-[13.5px] font-normal text-muted hover:text-ink transition-colors"
              style={{ color: 'rgba(13,27,62,0.55)' }}>
              {it.l}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden md:block text-[13px] font-medium text-ink">
                {user.user_metadata?.full_name?.split(' ')[0] ?? user.email}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-full border border-line hover:border-ink/20 transition-all"
                style={{ color: 'rgba(13,27,62,0.55)' }}
              >
                <LogOut size={13} />
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login"
              className="text-[13.5px] font-medium transition-colors"
              style={{ color: 'rgba(13,27,62,0.55)' }}>
              Sign in
            </Link>
          )}
          <Link href="/book" className="inline-flex items-center gap-2.5 bg-ink text-white font-medium text-[13.5px] px-5 py-2.5 rounded-full hover:-translate-y-px hover:bg-green-deep transition-all">
            Book a slot
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  )
}
