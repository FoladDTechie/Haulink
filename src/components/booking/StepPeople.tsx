'use client'

import type { BookingFormData } from '@/types'

interface Props {
  form: BookingFormData
  update: (field: keyof BookingFormData, value: string | boolean) => void
  onNext: () => void
  onBack: () => void
}

export function StepPeople({ form, update, onNext, onBack }: Props) {
  const canProceed =
    form.sender_name && form.sender_phone &&
    form.receiver_name && form.receiver_phone

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
          Sender Details
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Your Name">
            <input
              type="text"
              value={form.sender_name}
              onChange={e => update('sender_name', e.target.value)}
              placeholder="Amara Okafor"
              className="form-input"
            />
          </FormField>
          <FormField label="Your Phone">
            <input
              type="tel"
              value={form.sender_phone}
              onChange={e => update('sender_phone', e.target.value)}
              placeholder="08012345678"
              className="form-input"
            />
          </FormField>
        </div>
      </div>

      <div className="h-px bg-navy/8" />

      <div>
        <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
          Receiver Details
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Receiver Name">
            <input
              type="text"
              value={form.receiver_name}
              onChange={e => update('receiver_name', e.target.value)}
              placeholder="Emeka Adeleke"
              className="form-input"
            />
          </FormField>
          <FormField label="Receiver Phone">
            <input
              type="tel"
              value={form.receiver_phone}
              onChange={e => update('receiver_phone', e.target.value)}
              placeholder="07087654321"
              className="form-input"
            />
          </FormField>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Receiver will get an SMS with the tracking link when cargo is loaded.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl border-2 border-navy/15 text-navy
                     font-display font-bold text-sm hover:border-navy transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-[2] py-4 rounded-xl bg-navy text-white font-display font-bold
                     text-sm hover:bg-navy-mid transition-all disabled:opacity-40
                     disabled:cursor-not-allowed"
        >
          Continue to Payment →
        </button>
      </div>
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
