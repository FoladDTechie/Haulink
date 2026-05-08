'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { StepCargo } from '@/components/booking/StepCargo'
import { StepPeople } from '@/components/booking/StepPeople'
import { StepPayment } from '@/components/booking/StepPayment'
import { StepConfirmed } from '@/components/booking/StepConfirmed'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { useBookingForm } from '@/hooks/useBookingForm'
import type { TierId } from '@/types'
import { SLOT_TIERS } from '@/lib/constants'

const STEPS = [
  { label: 'Cargo' },
  { label: 'Details' },
  { label: 'Payment' },
  { label: 'Done' },
]

const slideVariants = {
  enter: { x: 36, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -36, opacity: 0 },
}

function BookingContent() {
  const searchParams = useSearchParams()
  const tierParam = searchParams.get('tier') as TierId | null
  const validTier = SLOT_TIERS.find(t => t.id === tierParam)?.id

  const {
    step, form, tier, totalNGN, isSubmitting, trackingCode, error,
    update, nextStep, prevStep, submit,
  } = useBookingForm(validTier)

  return (
    <div className="min-h-screen bg-dark flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="slot-grid absolute inset-0 opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/50 via-dark to-dark" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[500px] h-[500px] bg-green-brand/[0.04] rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <div className="flex-1 flex items-start justify-center px-6 pt-28 pb-16 relative z-10">
        <div className="w-full max-w-md">

          {/* Page title */}
          {step < 4 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="font-display font-extrabold text-2xl text-white tracking-tight mb-1">
                Book a Slot
              </h1>
              <p className="text-sm text-white/30">
                {form.origin && form.destination
                  ? `${form.origin} → ${form.destination}`
                  : 'Select your route and cargo details'}
              </p>
            </motion.div>
          )}

          {step < 4 && <StepIndicator current={step} steps={STEPS} variant="dark" />}

          {/* White card */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="p-8"
              >
                {step === 1 && (
                  <StepCargo form={form} update={update} onNext={nextStep} />
                )}
                {step === 2 && (
                  <StepPeople form={form} update={update} onNext={nextStep} onBack={prevStep} />
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
                  <StepConfirmed
                    trackingCode={trackingCode}
                    origin={form.origin}
                    destination={form.destination}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <div className="mx-8 mb-8 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                {error}
              </div>
            )}
          </div>

          {step < 4 && (
            <p className="text-center text-xs text-white/20 mt-5">
              Secured by Haulink &middot; Cardano-anchored proof of delivery
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense>
      <BookingContent />
    </Suspense>
  )
}
