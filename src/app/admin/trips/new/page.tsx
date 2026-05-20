'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const ORIGINS = ['Uyo', 'Calabar', 'Port Harcourt', 'Enugu', 'Kano', 'Aba']
const DESTINATIONS = ['Lagos', 'Abuja', 'Ibadan', 'Onitsha']

interface Distribution {
  micro: number
  half: number
  full: number
  bulk: number
}

const DEFAULT_DIST: Distribution = { micro: 4, half: 6, full: 4, bulk: 2 }

export default function NewTripPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [estimatedArrival, setEstimatedArrival] = useState('')
  const [dist, setDist] = useState<Distribution>(DEFAULT_DIST)

  const totalSlots = dist.micro + dist.half + dist.full + dist.bulk

  const updateDist = (tier: keyof Distribution, val: string) => {
    const n = Math.max(0, parseInt(val, 10) || 0)
    setDist(prev => ({ ...prev, [tier]: n }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination || !departureDate || !estimatedArrival) {
      toast.error('Fill in all required fields')
      return
    }
    if (totalSlots === 0) {
      toast.error('Add at least one slot')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, departureDate, estimatedArrival, distribution: dist }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to create trip')
      }

      toast.success('Trip created successfully')
      router.push('/admin')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden font-grotesk flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 slot-grid-dark pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="flex justify-center mb-10">
          <Link href="/admin" className="flex items-baseline font-serif-display font-medium text-[24px] tracking-[-0.02em] text-white">
            <span className="w-[9px] h-[9px] rounded-full bg-green-brand mr-3 self-center"
              style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.18)' }} />
            Hau<em className="font-serif-italic text-green-brand font-normal">link</em>
          </Link>
        </div>

        <div className="bg-paper rounded-3xl p-10 shadow-2xl shadow-black/40 border border-white/[0.06]">
          <div className="eyebrow mb-4 flex items-center gap-2.5" style={{ color: 'rgba(13,27,62,0.55)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-brand" />
            Admin · New trip
          </div>

          <h1 className="font-grotesk font-medium text-[32px] leading-[1] tracking-[-0.035em] text-ink mb-8">
            Schedule a{' '}
            <em className="font-serif-italic text-green-deep font-normal">trip.</em>
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Route */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Origin">
                <select value={origin} onChange={e => setOrigin(e.target.value)} className="w-full" required>
                  <option value="">Select</option>
                  {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Destination">
                <select value={destination} onChange={e => setDestination(e.target.value)} className="w-full" required>
                  <option value="">Select</option>
                  {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Departure Date">
                <input
                  type="date"
                  required
                  value={departureDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDepartureDate(e.target.value)}
                  className="w-full"
                />
              </Field>
              <Field label="Est. Arrival">
                <input
                  type="date"
                  required
                  value={estimatedArrival}
                  min={departureDate || new Date().toISOString().split('T')[0]}
                  onChange={e => setEstimatedArrival(e.target.value)}
                  className="w-full"
                />
              </Field>
            </div>

            {/* Slot distribution */}
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase font-medium text-muted mb-3">
                Slot Distribution <span className="normal-case tracking-normal font-normal ml-1">({totalSlots} total)</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {(['micro', 'half', 'full', 'bulk'] as const).map(tier => (
                  <div key={tier}>
                    <div className="text-[10px] tracking-widest uppercase text-muted font-medium mb-1.5 capitalize">
                      {tier}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={dist[tier]}
                      onChange={e => updateDist(tier, e.target.value)}
                      className="w-full text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2.5 bg-ink text-white font-medium text-[14px] px-5 py-3.5 rounded-full hover:-translate-y-px hover:bg-green-deep transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {isLoading ? 'Creating trip…' : 'Create trip & generate slots'}
              {!isLoading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.2em] uppercase font-medium text-muted mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}
