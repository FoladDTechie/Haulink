'use client'

import { useState, useCallback } from 'react'
import type { BookingFormData, TierId } from '@/types'
import { generateTrackingCode } from '@/lib/utils'
import { SLOT_TIERS } from '@/lib/constants'
import { createShipment } from '@/lib/supabase'
import { supabase } from '@/lib/supabase-browser'

export type BookingStep = 1 | 2 | 3 | 4  // cargo | people | payment | confirm

const initialData: BookingFormData = {
  tier_id: 'half',
  origin: '',
  destination: '',
  cargo_type: '',
  pickup_date: '',
  cargo_notes: '',
  sender_name: '',
  sender_phone: '',
  receiver_name: '',
  receiver_phone: '',
  payment_method: 'card',
  escrow_enabled: false,
}

export function useBookingForm(initialTier?: TierId) {
  const [step, setStep] = useState<BookingStep>(1)
  const [form, setForm] = useState<BookingFormData>({
    ...initialData,
    tier_id: initialTier || 'half',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [trackingCode, setTrackingCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tier = SLOT_TIERS.find(t => t.id === form.tier_id)!

  const totalNGN =
    tier.priceNGN + (form.escrow_enabled ? tier.escrowFeeNGN : 0)

  const update = useCallback(
    (field: keyof BookingFormData, value: string | boolean) => {
      setForm(prev => ({ ...prev, [field]: value }))
    },
    []
  )

  const nextStep = useCallback(() => {
    setStep(s => Math.min(s + 1, 4) as BookingStep)
  }, [])

  const prevStep = useCallback(() => {
    setStep(s => Math.max(s - 1, 1) as BookingStep)
  }, [])

  const submit = useCallback(
    async (cardanoTxHash?: string) => {
      setIsSubmitting(true)
      setError(null)

      try {
        const code = generateTrackingCode(form.origin)

        const { data: { session } } = await supabase.auth.getSession()

        const payload = {
          tracking_code: code,
          tier_id: form.tier_id,
          origin: form.origin,
          destination: form.destination,
          cargo_type: form.cargo_type,
          pickup_date: form.pickup_date,
          cargo_notes: form.cargo_notes,
          sender_name: form.sender_name,
          sender_phone: form.sender_phone,
          receiver_name: form.receiver_name,
          receiver_phone: form.receiver_phone,
          status: 'booked',
          payment_method: form.payment_method,
          payment_status: cardanoTxHash ? 'paid' : 'pending',
          escrow_enabled: form.escrow_enabled,
          amount_ngn: totalNGN,
          cardano_tx_hash: cardanoTxHash || null,
          user_id: session?.user?.id ?? null,
        }

        // In dev without Supabase configured, generate code locally
        try {
          await createShipment(payload)
        } catch {
          console.warn('Supabase not configured — using local tracking code')
        }

        setTrackingCode(code)
        setStep(4)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Booking failed')
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, totalNGN]
  )

  const reset = useCallback(() => {
    setForm(initialData)
    setStep(1)
    setTrackingCode(null)
    setError(null)
  }, [])

  return {
    step,
    form,
    tier,
    totalNGN,
    isSubmitting,
    trackingCode,
    error,
    update,
    nextStep,
    prevStep,
    submit,
    reset,
  }
}
