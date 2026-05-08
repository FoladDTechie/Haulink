'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const stats = [
  { num: '96', tail: '%', label: 'of Nigerian businesses are MSMEs locked out of structured freight.' },
  { num: '₦5.3', tail: 'k', label: 'average cost to move 25L palm oil today — opaque, cash, no recourse.' },
  { num: '2',  tail: 'd', label: 'typical Uyo → Lagos pilot transit, with realtime milestone tracking.' },
  { num: '0',  tail: '%', label: 'digital infrastructure for the trade between cities — until now.' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const item = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-paper">
      <div className="max-w-[1240px] mx-auto px-8 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-[1.15fr_0.85fr] gap-20 items-end"
        >
          {/* Left — headline */}
          <div>
            <motion.div variants={item} className="eyebrow mb-9">
              <span className="eyebrow-dot" />Now in pilot · Uyo → Lagos
            </motion.div>

            <motion.h1
              variants={item}
              className="font-grotesk font-medium text-ink leading-[0.92] tracking-[-0.045em] text-balance"
              style={{ fontSize: 'clamp(56px, 9.4vw, 144px)' }}
            >
              Containerizing<br />
              <span className="accent-it">trailer</span> space<br />
              for{' '}
              <span
                style={{
                  backgroundImage:
                    'linear-gradient(transparent 70%, rgba(46,204,82,0.45) 70%)',
                  padding: '0 .04em',
                }}
              >
                small
              </span>{' '}
              trade.
            </motion.h1>

            <motion.p
              variants={item}
              className="font-grotesk text-base leading-[1.55] text-muted max-w-[42ch] mt-8"
              style={{ color: 'rgba(13,27,62,0.55)' }}
            >
              A standardized freight network for Nigerian SMEs, traders and farmer co‑ops.
              Book a slot, pay in Naira or ADA, track every milestone — no park‑gate negotiations.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-3 mt-11">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-ink text-white font-medium text-[13.5px] px-6 py-3.5 rounded-full hover:-translate-y-px hover:bg-green-deep transition-all"
              >
                Book a slot
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/#how"
                className="inline-flex items-center gap-2 text-ink font-medium text-[13.5px] px-6 py-3.5 rounded-full border border-line-strong hover:bg-ink hover:text-white transition-all"
              >
                How it works
              </Link>
            </motion.div>
          </div>

          {/* Right — stats + quote */}
          <motion.aside variants={item} className="flex flex-col gap-9 pb-2">
            <div className="grid grid-cols-2 border-t border-b border-line">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`py-6 ${i % 2 === 0 ? 'pr-6 border-r border-line' : 'pl-6'}`}
                >
                  <div className="font-grotesk text-[44px] font-medium leading-none tracking-[-0.04em] text-ink mb-2">
                    {s.num}
                    <span className="accent-it">{s.tail}</span>
                  </div>
                  <div className="text-[12px] text-muted leading-[1.4]" style={{ color: 'rgba(13,27,62,0.55)' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="font-serif-italic text-[22px] leading-[1.35] text-ink tracking-[-0.01em] text-balance">
              <span className="text-green-deep text-[64px] leading-none align-[-22px] mr-1.5">"</span>
              We don&apos;t build trucks. We build the <em className="not-italic font-serif-italic" style={{ fontStyle: 'italic' }}>shelf</em> inside them — so the woman with twelve cartons of palm oil can ship like the distributor with twelve hundred.
              <span className="block font-grotesk not-italic text-[11.5px] tracking-[0.18em] uppercase text-muted mt-5" style={{ color: 'rgba(13,27,62,0.55)' }}>
                — Haulink team, founding note
              </span>
            </p>
          </motion.aside>
        </motion.div>
      </div>

      {/* Big watermark */}
      <div
        aria-hidden
        className="absolute left-0 right-0 -bottom-7 font-serif-italic text-center pointer-events-none whitespace-nowrap select-none"
        style={{
          fontSize: 'clamp(120px, 22vw, 320px)',
          lineHeight: 0.8,
          letterSpacing: '-0.04em',
          color: 'var(--ink)',
          opacity: 0.04,
        }}
      >
        haulink
      </div>
    </section>
  )
}
