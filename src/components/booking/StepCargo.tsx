'use client'

import { SLOT_TIERS, CARGO_TYPES, TRADE_ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { BookingFormData, TierId } from '@/types'

interface Props {
  form: BookingFormData
  update: (field: keyof BookingFormData, value: string | boolean) => void
  onNext: () => void
}

export function StepCargo({ form, update, onNext }: Props) {
  const origins = [...new Set(TRADE_ROUTES.map(r => r.origin))]
  const destinations = [...new Set(TRADE_ROUTES.map(r => r.destination))]

  const canProceed =
    form.origin && form.destination && form.cargo_type && form.pickup_date

  return (
    <div className="space-y-6">
      {/* Tier selector */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
          Cargo Slot
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {SLOT_TIERS.map(tier => (
            <button
              key={tier.id}
              onClick={() => update('tier_id', tier.id)}
              className={cn(
                'relative p-3.5 rounded-xl border-2 text-left transition-all',
                form.tier_id === tier.id
                  ? 'border-green-brand bg-green-muted'
                  : 'border-navy/10 bg-cream hover:border-navy/25'
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
            </button>
          ))}
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
