'use client'

import { useState, useCallback } from 'react'
import type { BookingFormData, TierId } from '@/types'
import { generateTrackingCode } from '@/lib/utils'
import { SLOT_TIERS, ROUTE_MULTIPLIERS } from '@/lib/constants'
import { createShipment, bookSlot, getAvailableSlots } from '@/lib/supabase'
import { supabase } from '@/lib/supabase-browser'

export type BookingStep = 1 | 2 | 3 | 4  // cargo | people | payment | confirm

const initialData: BookingFormData = {
  tier_id: 'half',
  trip_id: '',
  trip_reference: '',
  origin: '',
  destination: '',
  cargo_type: '',
  pickup_date: '',
  cargo_notes: '',
  sender_name: '',
  sender_phone: '',
  receiver_name: '',
  receiver_phone: '',
  payment_method: 'ada',
  escrow_enabled: false,
  estimated_boxes: 0,
  cargo_unit_type: '',
  cargo_unit_quantity: 0,
}

export function useBookingForm(initialTier?: TierId) {
  const [step, setStep] = useState<BookingStep>(1)
  const [form, setForm] = useState<BookingFormData>({
    ...initialData,
    tier_id: initialTier || 'half',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidatingSlots, setIsValidatingSlots] = useState(false)
  const [trackingCode, setTrackingCode] = useState<string | null>(null)
  const [slotNumber, setSlotNumber] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tier = SLOT_TIERS.find(t => t.id === form.tier_id)!

  const routeKey = `${form.origin}-${form.destination}`
  const routeMultiplier = ROUTE_MULTIPLIERS[routeKey] ?? 1.0
  const basePrice =
    form.estimated_boxes && form.estimated_boxes > 0
      ? Math.round(tier.pricePerBox * form.estimated_boxes * routeMultiplier)
      : Math.round(tier.priceNGN * routeMultiplier)
  const totalNGN = basePrice + (form.escrow_enabled ? tier.escrowFeeNGN : 0)

  const update = useCallback(
    (field: keyof BookingFormData, value: string | boolean | number) => {
      setForm(prev => ({ ...prev, [field]: value }))
    },
    []
  )

  const nextStep = useCallback(async () => {
    setError(null)

    // Gate before payment: re-confirm slots are still available so the user
    // can never reach the payment screen for a sold-out tier
    if (step === 2 && form.trip_id) {
      setIsValidatingSlots(true)
      try {
        const available = await getAvailableSlots(form.trip_id, form.tier_id)
        if (available <= 0) {
          setError(
            `Sorry, all ${tier.name} slots on this trip have just been booked. ` +
            'Please select a different trip or tier.'
          )
          return
        }
      } catch {
        // Availability check unavailable (offline / demo mode) — let the user
        // through; reserve_slot is atomic and will reject at booking time
      } finally {
        setIsValidatingSlots(false)
      }
    }

    setStep(s => Math.min(s + 1, 4) as BookingStep)
  }, [step, form.trip_id, form.tier_id, tier.name])

  const prevStep = useCallback(() => {
    setStep(s => Math.max(s - 1, 1) as BookingStep)
  }, [])

  const submit = useCallback(
    async (cardanoTxHash?: string) => {
      setIsSubmitting(true)
      setError(null)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id ?? null

        const basePayload = {
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
        }

        if (form.trip_id) {
          try {
            const result = await bookSlot(form.trip_id, form.tier_id, userId, basePayload)
            setTrackingCode(result.bookingReference)
            setSlotNumber(result.slotNumber)
          } catch (err) {
            // Race condition: another user took the last slot between the
            // pre-payment check and reserve_slot (raises P0001 / "No available slots")
            const message = (err as { message?: string })?.message ?? ''
            const code = (err as { code?: string })?.code
            const noSlots = code === 'P0001' || /no available slots/i.test(message)
            if (cardanoTxHash && noSlots) {
              console.error(
                'Slot reservation failed after successful payment — recover via tx hash:',
                cardanoTxHash
              )
              setError(
                'Payment received but no slots were available on this trip. ' +
                'Please contact support at babdulazeez3@gmail.com with your ' +
                'transaction hash for a refund.'
              )
              return
            }
            throw err
          }
        } else {
          const code = generateTrackingCode(form.origin)
          try {
            await createShipment({ ...basePayload, tracking_code: code, user_id: userId })
          } catch {
            console.warn('Supabase not configured — using local tracking code')
          }
          setTrackingCode(code)
        }

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
    setSlotNumber(null)
    setError(null)
  }, [])

  return {
    step,
    form,
    tier,
    totalNGN,
    isSubmitting,
    isValidatingSlots,
    trackingCode,
    slotNumber,
    error,
    update,
    nextStep,
    prevStep,
    submit,
    reset,
  }
}
