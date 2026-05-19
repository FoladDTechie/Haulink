'use client'

import { useState, useEffect } from 'react'
import { SLOT_TIERS, CARGO_TYPES, TRADE_ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getAvailableTrips, getSlotAvailability } from '@/lib/supabase'
import type { BookingFormData, Trip } from '@/types'

interface Props {
  form: BookingFormData
  update: (field: keyof BookingFormData, value: string | boolean) => void
  onNext: () => void
}

function formatDepartureDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export function StepCargo({ form, update, onNext }: Props) {
  const origins = [...new Set(TRADE_ROUTES.map(r => r.origin))]
  const destinations = [...new Set(TRADE_ROUTES.map(r => r.destination))]

  const [availableTrips, setAvailableTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)
  const [slotAvailability, setSlotAvailability] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!form.origin || !form.destination) {
      setAvailableTrips([])
      return
    }
    setTripsLoading(true)
    getAvailableTrips(form.origin, form.destination)
      .then(setAvailableTrips)
      .catch(() => setAvailableTrips([]))
      .finally(() => setTripsLoading(false))

    // Clear trip selection when route changes
    update('trip_id', '')
    update('trip_reference', '')
    setSlotAvailability({})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.origin, form.destination])

  useEffect(() => {
    if (!form.trip_id) {
      setSlotAvailability({})
      return
    }
    getSlotAvailability(form.trip_id)
      .then(setSlotAvailability)
      .catch(() => setSlotAvailability({}))
  }, [form.trip_id])

  const hasTrips = availableTrips.length > 0
  const canProceed =
    form.origin &&
    form.destination &&
    form.cargo_type &&
    form.pickup_date &&
    (!hasTrips || form.trip_id)

  return (
    <div className="space-y-6">
      {/* Tier selector */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
          Cargo Slot
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {SLOT_TIERS.map(tier => {
            const available = slotAvailability[tier.id]
            const hasAvailability = !!form.trip_id && available !== undefined
            const isSoldOut = hasAvailability && available === 0

            return (
              <button
                key={tier.id}
                onClick={() => !isSoldOut && update('tier_id', tier.id)}
                disabled={isSoldOut}
                className={cn(
                  'relative p-3.5 rounded-xl border-2 text-left transition-all',
                  form.tier_id === tier.id
                    ? 'border-green-brand bg-green-muted'
                    : 'border-navy/10 bg-cream hover:border-navy/25',
                  isSoldOut && 'opacity-40 cursor-not-allowed'
                )}
              >
                {tier.popular && (
                  <span className="absolute -top-2 right-3 bg-green-brand text-navy
                                   text-[9px] font-extrabold tracking-wider uppercase
                                   px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <div className="font-display font-bold text-navy text-sm">{tier.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{tier.range}</div>
                {hasAvailability && (
                  <div className={cn(
                    'text-[10px] font-semibold mt-1.5',
                    available === 0 ? 'text-red-400' : 'text-green-600'
                  )}>
                    {available === 0 ? 'Sold out' : `${available} slot${available === 1 ? '' : 's'} left`}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Route */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Origin City">
          <select
            value={form.origin}
            onChange={e => update('origin', e.target.value)}
            className="form-select"
          >
            <option value="">Select origin</option>
            {origins.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Destination">
          <select
            value={form.destination}
            onChange={e => update('destination', e.target.value)}
            className="form-select"
          >
            <option value="">Select destination</option>
            {destinations.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Departure trip selector */}
      {(form.origin && form.destination) && (
        <FormField label="Select Departure">
          {tripsLoading ? (
            <div className="form-select text-gray-400">Loading trips…</div>
          ) : availableTrips.length === 0 ? (
            <div className="rounded-xl border border-dashed border-navy/20 bg-cream px-4 py-3 text-xs text-gray-400">
              No scheduled trips on this route — booking will use a local reference.
            </div>
          ) : (
            <select
              value={form.trip_id}
              onChange={e => {
                const trip = availableTrips.find(t => t.id === e.target.value)
                update('trip_id', e.target.value)
                update('trip_reference', trip?.reference ?? '')
              }}
              className="form-select"
            >
              <option value="">Select a departure</option>
              {availableTrips.map(trip => (
                <option key={trip.id} value={trip.id}>
                  {trip.reference} · {formatDepartureDate(trip.departure_date)}
                </option>
              ))}
            </select>
          )}
        </FormField>
      )}

      {/* Cargo type + date */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Cargo Type">
          <select
            value={form.cargo_type}
            onChange={e => update('cargo_type', e.target.value)}
            className="form-select"
          >
            <option value="">Select type</option>
            {CARGO_TYPES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Pickup Date">
          <input
            type="date"
            value={form.pickup_date}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => update('pickup_date', e.target.value)}
            className="form-input"
          />
        </FormField>
      </div>

      <FormField label="Cargo Notes (optional)">
        <textarea
          value={form.cargo_notes}
          onChange={e => update('cargo_notes', e.target.value)}
          placeholder="Fragile, keep upright, temperature sensitive..."
          rows={2}
          className="form-input resize-none"
        />
      </FormField>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-4 rounded-xl bg-navy text-white font-display font-bold
                   text-base transition-all hover:bg-navy-mid disabled:opacity-40
                   disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}
