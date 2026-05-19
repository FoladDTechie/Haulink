'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Share2, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { SHIPMENT_MILESTONES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Props {
  trackingCode: string
  origin: string
  destination: string
  cardanoTxHash?: string
  slotNumber?: number
  tripReference?: string
}

export function StepConfirmed({ trackingCode, origin, destination, cardanoTxHash, slotNumber, tripReference }: Props) {
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${trackingCode}`

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Track my Haulink shipment', text: `Track shipment ${trackingCode}`, url: trackingUrl })
    } else {
      await navigator.clipboard.writeText(trackingUrl)
      toast.success('Tracking link copied!')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-2"
    >
      {/* SVG check mark — no emoji */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 22 }}
        className="w-16 h-16 rounded-full bg-green-muted border border-green-brand/25
                   flex items-center justify-center mx-auto mb-6"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M6 14l6 6 10-12"
            stroke="#2ECC52"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <h2 className="font-display font-extrabold text-xl text-navy mb-2 tracking-tight">
        Shipment Booked
      </h2>
      <p className="text-navy/45 text-sm leading-relaxed max-w-xs mx-auto mb-8">
        Your slot is confirmed. Share the tracking code with your receiver — they get
        live updates at every milestone.
      </p>

      {/* Tracking code */}
      <div className="bg-dark rounded-2xl px-8 py-5 inline-block mb-3">
        <div className="text-[10px] text-white/35 uppercase tracking-widest mb-2">
          Booking Reference
        </div>
        <div className="font-mono font-bold text-2xl tracking-[0.12em] text-green-brand">
          {trackingCode}
        </div>
        {(slotNumber != null || tripReference) && (
          <div className="text-white/55 text-xs font-medium mt-2">
            {slotNumber != null && `Slot ${String(slotNumber).padStart(2, '0')}`}
            {slotNumber != null && tripReference && ' · '}
            {tripReference && `Trip ${tripReference}`}
          </div>
        )}
        <div className="text-white/30 text-xs mt-1.5">
          {origin} &rarr; {destination}
        </div>
      </div>

      {/* Cardano tx hash */}
      {cardanoTxHash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto max-w-xs mt-3 bg-[#0033AD]/[0.06] border border-[#0033AD]/15
                     rounded-xl px-4 py-3 text-left"
        >
          <div className="text-[10px] font-bold text-[#0033AD] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#0033AD] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            Anchored on Cardano
          </div>
          <code className="text-[10px] text-navy/50 font-mono break-all">{cardanoTxHash}</code>
        </motion.div>
      )}

      {/* Milestone timeline */}
      <div className="mt-8 mb-6">
        <div className="text-[10px] font-medium tracking-[0.18em] uppercase text-gray-400 mb-4">
          Shipment Journey
        </div>
        <div className="flex items-center justify-between max-w-xs mx-auto">
          {SHIPMENT_MILESTONES.map((m, i) => (
            <div key={m.status} className="flex items-center">
              <div className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                i === 0 ? 'bg-green-brand' : 'bg-gray-200'
              )} />
              {i < SHIPMENT_MILESTONES.length - 1 && (
                <div className={cn('h-px mx-0.5', i === 0 ? 'bg-green-brand' : 'bg-gray-200')}
                     style={{ width: '20px' }} />
              )}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-gray-400 mt-2 leading-relaxed">
          Booked &rarr; Collected &rarr; Loaded &rarr; In Transit &rarr; Arrived &rarr; Delivered
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={share}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                     border border-gray-200 text-navy/60 font-display font-semibold text-sm
                     hover:border-gray-300 hover:text-navy transition-all"
        >
          <Share2 size={14} />
          Share
        </button>
        <Link
          href={`/track/${trackingCode}`}
          className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl
                     bg-green-brand text-black font-display font-bold text-sm
                     hover:bg-green-dark transition-all"
        >
          Track Shipment
          <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  )
}
