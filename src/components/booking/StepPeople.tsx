'use client'

import { useState } from 'react'
import type { BookingFormData } from '@/types'

// Nigerian numbers: 0 or +234, then 7/8/9, then 0/1, then 8 more digits
const NG_PHONE_REGEX = /^(\+234|0)[789][01]\d{8}$/

const isValidPhone = (phone: string) => NG_PHONE_REGEX.test(phone.trim())

const PHONE_ERROR = 'Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)'
const PHONE_HINT = 'Format: 08012345678 or +2348012345678'

interface Props {
  form: BookingFormData
  update: (field: keyof BookingFormData, value: string | boolean) => void
  onNext: () => void
  onBack: () => void
}

export function StepPeople({ form, update, onNext, onBack }: Props) {
  const [phoneTouched, setPhoneTouched] = useState<{ sender: boolean; receiver: boolean }>({
    sender: false,
    receiver: false,
  })

  const senderPhoneInvalid = !!form.sender_phone && !isValidPhone(form.sender_phone)
  const receiverPhoneInvalid = !!form.receiver_phone && !isValidPhone(form.receiver_phone)

  const canProceed =
    form.sender_name && isValidPhone(form.sender_phone) &&
    form.receiver_name && isValidPhone(form.receiver_phone)

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
              onBlur={() => setPhoneTouched(t => ({ ...t, sender: true }))}
              placeholder="08012345678"
              className="form-input"
            />
            {phoneTouched.sender && senderPhoneInvalid ? (
              <p className="text-xs text-red-500 mt-1.5">{PHONE_ERROR}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1.5">{PHONE_HINT}</p>
            )}
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
              onBlur={() => setPhoneTouched(t => ({ ...t, receiver: true }))}
              placeholder="07087654321"
              className="form-input"
            />
            {phoneTouched.receiver && receiverPhoneInvalid ? (
              <p className="text-xs text-red-500 mt-1.5">{PHONE_ERROR}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1.5">{PHONE_HINT}</p>
            )}
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
