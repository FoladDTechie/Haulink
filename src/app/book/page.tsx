'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { StepCargo } from '@/components/booking/StepCargo'
import { StepPeople } from '@/components/booking/StepPeople'
import { StepPayment } from '@/components/booking/StepPayment'
import { StepConfirmed } from '@/components/booking/StepConfirmed'
import { useBookingForm } from '@/hooks/useBookingForm'
import type { TierId } from '@/types'
import { SLOT_TIERS } from '@/lib/constants'

const ROMAN = ['i.', 'ii.', 'iii.', 'iv.']
const STEPS = [
  { label: 'Cargo & route' },
  { label: 'Sender & receiver' },
  { label: 'Payment & escrow' },
  { label: 'Confirmed' },
]

const slideVariants = {
  enter:  { y: 16, opacity: 0 },
  center: { y: 0,  opacity: 1 },
  exit:   { y: -16, opacity: 0 },
}

function BookingContent() {
  const searchParams = useSearchParams()
  const tierParam = searchParams.get('tier') as TierId | null
  const validTier = SLOT_TIERS.find(t => t.id === tierParam)?.id

  const {
    step, form, tier, totalNGN, isSubmitting, trackingCode, slotNumber, error,
    update, prevStep, nextStep, submit,
  } = useBookingForm(validTier)

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden font-grotesk">
      {/* grid bg */}
      <div className="absolute inset-0 slot-grid-dark pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-8 pt-12 pb-20 relative z-10">

        {/* Top nav */}
        <div className="flex justify-between items-center mb-14 text-white">
          <Link href="/" className="flex items-baseline font-serif-display font-medium text-[24px] tracking-[-0.02em]">
            <span className="w-[9px] h-[9px] rounded-full bg-green-brand mr-3 self-center"
              style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.18)' }} />
            Hau<em className="font-serif-italic text-green-brand">link</em>
          </Link>
          <div className="flex items-center gap-6 text-[13px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-brand"
                style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.2)' }} />
              Pilot · Uyo → Lagos
            </span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span className="flex items-center gap-2.5 tracking-[0.18em] uppercase text-[11px] font-medium">
              <span className="w-[22px] h-[22px] rounded-full bg-green-brand text-ink font-semibold grid place-items-center text-[11px] tracking-normal">
                {step}
              </span>
              Step 0{step} of 04
            </span>
          </div>
        </div>

        {/* Head */}
        <div className="flex justify-between items-end gap-12 mb-12 flex-wrap text-white">
          <div>
            <div className="eyebrow mb-4.5 flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-brand"
                style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.2)' }} />
              {step === 4 ? 'Confirmed' : 'Checkout'}
            </div>
            <h1 className="font-grotesk font-medium leading-[0.95] tracking-[-0.045em] text-white"
              style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
              {step === 1 && <>Tell us your <span className="font-serif-italic text-green-brand font-normal">cargo.</span></>}
              {step === 2 && <>Who&apos;s <span className="font-serif-italic text-green-brand font-normal">sending</span> &amp; receiving?</>}
              {step === 3 && <>Pay <span className="font-serif-italic text-green-brand font-normal">securely.</span></>}
              {step === 4 && <>You&apos;re <span className="font-serif-italic text-green-brand font-normal">booked.</span></>}
            </h1>
          </div>
          {step < 4 && (
            <p className="font-serif-italic text-[22px] leading-[1.3] max-w-[34ch] tracking-[-0.01em]"
              style={{ color: 'rgba(255,255,255,0.7)' }}>
              {form.origin && form.destination
                ? <>{`Trip `}<em className="not-italic font-grotesk text-green-brand">{trackingCode || '0421'}</em>{` · ${form.origin} `}<span className="text-green-brand mx-1.5">→</span>{` ${form.destination} · ${tier.name} · ETA ${tier.id === 'bulk' ? '3' : '2'} days.`}</>
                : <>A standardized slot, predictable price, on‑chain proof of delivery.</>
              }
            </p>
          )}
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div className="flex items-center border-t border-b border-white/10 mb-10 text-white">
            {STEPS.map((s, i) => {
              const idx = i + 1
              const state = idx < step ? 'done' : idx === step ? 'now' : ''
              return (
                <div key={s.label}
                  className={cn(
                    'flex-1 flex items-center gap-3.5 px-6 py-[18px] border-r border-white/10 last:border-r-0 relative',
                    state === 'now' && 'bg-white/[0.025]',
                    state === 'done' && 'opacity-70',
                  )}>
                  <div className={cn(
                    'font-serif-italic text-[24px] font-normal tracking-[-0.02em]',
                    state === 'done' ? 'text-white/35' : 'text-green-brand',
                  )}>
                    {ROMAN[i]}
                  </div>
                  <div className="flex flex-col">
                    <div className={cn(
                      'text-[11px] tracking-[0.22em] uppercase font-medium mb-1',
                      state === 'now' ? 'text-green-brand' : 'text-white/45',
                    )}>
                      Step 0{idx}{state === 'now' ? ' · Now' : ''}
                    </div>
                    <div className={cn(
                      'text-[14px] font-medium',
                      state === 'done' ? 'text-white/55' : 'text-white',
                    )}>{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 1 && (
              <div className="bg-paper rounded-3xl p-10 max-w-2xl mx-auto border border-white/[0.06] shadow-2xl shadow-black/40">
                <StepCargo form={form} update={update} onNext={nextStep} />
              </div>
            )}
            {step === 2 && (
              <div className="bg-paper rounded-3xl p-10 max-w-2xl mx-auto border border-white/[0.06] shadow-2xl shadow-black/40">
                <StepPeople form={form} update={update} onNext={nextStep} onBack={prevStep} />
              </div>
            )}
            {step === 3 && (
              <StepPayment
                form={form}
                totalNGN={totalNGN}
                tierName={tier.name}
                basePriceNGN={tier.priceNGN}
                escrowFeeNGN={tier.escrowFeeNGN}
                isSubmitting={isSubmitting}
                update={update}
                onSubmit={submit}
                onBack={prevStep}
              />
            )}
            {step === 4 && trackingCode && (
              <div className="bg-paper rounded-3xl p-10 max-w-2xl mx-auto border border-white/[0.06] shadow-2xl shadow-black/40">
                <StepConfirmed
                  trackingCode={trackingCode}
                  origin={form.origin}
                  destination={form.destination}
                  slotNumber={slotNumber ?? undefined}
                  tripReference={form.trip_reference || undefined}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-6 max-w-2xl mx-auto text-sm text-red-200 bg-red-900/40 rounded-xl px-4 py-3 border border-red-500/30">
            {error}
          </div>
        )}

        {/* Trust note */}
        {step === 3 && (
          <div className="mt-12 pt-7 border-t border-white/10 flex justify-between items-end gap-8 flex-wrap"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            <p className="font-serif-italic text-[18px] leading-[1.4] max-w-[42ch] tracking-[-0.005em]"
              style={{ color: 'rgba(255,255,255,0.75)' }}>
              <span className="text-green-brand text-[32px] leading-none align-[-10px] mr-1.5">&ldquo;</span>
              Funds never touch a driver&apos;s pocket. They sit in escrow, on‑chain, and only release when your receiver confirms delivery — never before.
            </p>
            <div className="flex gap-3.5 flex-wrap">
              {['PCI‑compliant', 'Cardano‑anchored', 'Support 24 / 7'].map((b) => (
                <span key={b} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/15 text-[11px] tracking-[0.18em] uppercase font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-brand"
                    style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.2)' }} />
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function cn(...c: Array<string | false | undefined>) { return c.filter(Boolean).join(' ') }

export default function BookPage() {
  return (
    <Suspense>
      <BookingContent />
    </Suspense>
  )
}
