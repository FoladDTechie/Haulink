'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SLOT_TIERS } from '@/lib/constants'
import { formatNGN } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-8 bg-cream">
      <div className="max-w-[1240px] mx-auto">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-20 items-end mb-16">
          <div>
            <div className="eyebrow mb-6"><span className="eyebrow-dot" />Slot tiers</div>
            <h2
              className="font-grotesk font-medium text-ink leading-[1.0] tracking-[-0.04em] text-balance"
              style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
            >
              Pick your <span className="accent-it">cargo class</span>.
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-muted max-w-[38ch]" style={{ color: 'rgba(13,27,62,0.55)' }}>
            Standardized space. Predictable pricing. No park‑gate negotiations,
            no informal fees, no surprises at the loading bay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-line-strong rounded-3xl overflow-hidden bg-paper">
          {SLOT_TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={cn(
                'relative p-10 flex flex-col border-r border-line last:border-r-0 transition-colors duration-300',
                tier.popular ? 'bg-ink text-white hover:bg-[#0e1430]' : 'hover:bg-white',
              )}
            >
              {tier.popular && (
                <div className="text-[10.5px] tracking-[0.2em] uppercase text-green-brand mb-6 font-medium">
                  — Most chosen
                </div>
              )}

              <div className={cn(
                'text-[12px] tracking-[0.18em] uppercase mb-2',
                tier.popular ? 'text-white/45' : 'text-muted',
              )}
                style={!tier.popular ? { color: 'rgba(13,27,62,0.55)' } : undefined}
              >
                {tier.label}
              </div>

              <div className={cn(
                'font-grotesk font-medium text-[44px] leading-none tracking-[-0.04em] mb-1.5',
                tier.popular ? 'text-white' : 'text-ink',
              )}>
                {tier.range.split('–')[0]}
                <span className={cn('accent-it', tier.popular && 'text-green-brand')}>
                  {tier.range.includes('–') ? '–' : '+'}
                </span>
                {tier.range.replace(/^\d+[–+]?/, '').trim().split(' ')[0]}
              </div>
              <div className={cn('text-[13px] mb-8', tier.popular ? 'text-white/55' : 'text-muted')}
                style={!tier.popular ? { color: 'rgba(13,27,62,0.55)' } : undefined}
              >
                {tier.description}
              </div>

              <div
                className={cn(
                  'font-grotesk font-medium text-[40px] leading-none tracking-[-0.04em] pt-6 border-t mb-1',
                  tier.popular ? 'text-white border-white/12' : 'text-ink border-line',
                )}
              >
                from {formatNGN(tier.priceNGN)}
              </div>
              <div className={cn(
                'text-[13px] font-medium mb-1',
                tier.popular ? 'text-green-brand' : 'text-green-deep',
              )}>
                {formatNGN(tier.pricePerBox)} per box
              </div>
              <div className={cn(
                'text-[11.5px] tracking-[0.18em] uppercase mb-6',
                tier.popular ? 'text-white/50' : 'text-muted',
              )}
                style={!tier.popular ? { color: 'rgba(13,27,62,0.55)' } : undefined}
              >
                {tier.range}
              </div>

              <ul className="space-y-0 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className={cn(
                      'text-[13px] leading-[1.5] py-2.5 border-t border-dashed flex items-start gap-2.5',
                      tier.popular ? 'text-white/70 border-white/8' : 'text-navy border-line',
                    )}
                  >
                    <span className={cn(
                      'text-[18px] leading-none mt-px font-bold',
                      tier.popular ? 'text-green-brand' : 'text-green-deep',
                    )}>·</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/book?tier=${tier.id}`}
                className={cn(
                  'inline-flex items-center justify-between gap-2 px-5 py-3.5 rounded-full font-medium text-[13px] transition-all',
                  tier.popular
                    ? 'bg-green-brand text-ink border border-green-brand hover:bg-white hover:border-white'
                    : 'bg-transparent text-ink border border-line-strong hover:bg-ink hover:text-white hover:border-ink',
                )}
              >
                Book {tier.label}
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
