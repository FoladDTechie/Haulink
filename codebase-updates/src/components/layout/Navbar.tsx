'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Navbar() {
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
        <Link href="/book" className="inline-flex items-center gap-2.5 bg-ink text-white font-medium text-[13.5px] px-5 py-2.5 rounded-full hover:-translate-y-px hover:bg-green-deep transition-all">
          Book a slot
          <ArrowRight size={14} />
        </Link>
      </div>
    </header>
  )
}
