'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Package, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import {
  getShipmentByCode,
  subscribeToShipment,
  getSlotEvents,
  getShipmentPOD,
  getShipmentSlotInfo,
} from '@/lib/supabase'
import { SHIPMENT_MILESTONES } from '@/lib/constants'
import { getStatusIndex, formatNGN } from '@/lib/utils'
import type { Shipment, SlotEvent, PODRecord } from '@/types'

export default function TrackPage() {
  const { code } = useParams() as { code: string }
  const [shipment, setShipment]     = useState<Shipment | null>(null)
  const [slotEvents, setSlotEvents] = useState<SlotEvent[]>([])
  const [podRecord, setPodRecord]   = useState<PODRecord | null>(null)
  const [slotInfo, setSlotInfo]     = useState<{ slotNumber: number | null; tripReference: string | null }>({
    slotNumber: null, tripReference: null,
  })
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const s = await getShipmentByCode(code)
        if (cancelled) return
        setShipment(s as Shipment)

        const shipmentId = (s as Shipment).id

        const [events, pod, info] = await Promise.all([
          getSlotEvents(shipmentId),
          (s as Shipment).status === 'delivered' ? getShipmentPOD(shipmentId) : Promise.resolve(null),
          getShipmentSlotInfo(shipmentId),
        ])

        if (!cancelled) {
          setSlotEvents(events)
          setPodRecord(pod)
          setSlotInfo(info)
        }
      } catch {
        if (!cancelled) setError('Shipment not found. Check your tracking code.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    const channel = subscribeToShipment(code, async (updated) => {
      setShipment(prev => ({ ...prev!, ...(updated as Partial<Shipment>) }))
      const updatedId = (updated as Record<string, unknown>).id as string | undefined
      if (updatedId && !cancelled) {
        const [events, pod] = await Promise.all([
          getSlotEvents(updatedId),
          (updated as { status?: string }).status === 'delivered'
            ? getShipmentPOD(updatedId)
            : Promise.resolve(null),
        ])
        if (!cancelled) {
          setSlotEvents(events)
          if (pod !== null) setPodRecord(pod)
        }
      }
    })

    return () => {
      cancelled = true
      channel.unsubscribe()
    }
  }, [code])

  if (loading) return <LoadingState />
  if (error || !shipment) return <ErrorState code={code} message={error} />

  const podData = podRecord ?? (shipment.pod_photo_url ? {
    photo_url: shipment.pod_photo_url,
    receiver_name: shipment.pod_receiver_name,
    created_at: shipment.pod_timestamp,
  } : null)

  const statusIdx = getStatusIndex(shipment.status)

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
        {/* Code header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy rounded-2xl p-6 text-center mb-6"
        >
          <div className="text-xs text-white/40 uppercase tracking-widest mb-2">
            Tracking Shipment
          </div>
          <div className="font-mono font-bold text-3xl tracking-widest text-green-brand mb-3">
            {code}
          </div>
          <div className="flex items-center justify-center gap-3 text-sm text-white/60">
            <span>{shipment.origin}</span>
            <span className="text-green-brand">──→</span>
            <span>{shipment.destination}</span>
          </div>
          {(slotInfo.slotNumber !== null || slotInfo.tripReference) && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-4 text-xs text-white/40">
              {slotInfo.tripReference && (
                <span>Trip <span className="text-white/60 font-mono">{slotInfo.tripReference}</span></span>
              )}
              {slotInfo.slotNumber !== null && (
                <span>Slot <span className="text-white/60 font-mono">#{slotInfo.slotNumber}</span></span>
              )}
            </div>
          )}
        </motion.div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg shadow-navy/6 p-6 mb-4 border border-navy/6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">
                Current Status
              </div>
              <div className="font-display font-bold text-lg text-navy capitalize">
                {shipment.status.replace('_', ' ')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-brand/10 flex items-center justify-center">
              <Package size={18} className="text-green-dark" />
            </div>
          </div>

          {/* Milestone timeline */}
          <div className="space-y-3">
            {SHIPMENT_MILESTONES.map((milestone, i) => {
              const done   = i < statusIdx
              const active = i === statusIdx
              return (
                <motion.div
                  key={milestone.status}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0">
                    {done ? (
                      <CheckCircle2 size={20} className="text-green-brand" />
                    ) : active ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Circle size={20} className="text-navy fill-navy" />
                      </motion.div>
                    ) : (
                      <Circle size={20} className="text-navy/15" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${
                      active ? 'text-navy' : done ? 'text-navy/60' : 'text-navy/25'
                    }`}>
                      {milestone.label}
                    </div>
                  </div>
                  {active && (
                    <span className="text-xs bg-navy text-white px-2.5 py-1 rounded-full font-semibold">
                      Now
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Shipment details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-navy/6 space-y-3"
        >
          <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
            Shipment Details
          </div>
          <DetailRow label="Cargo"       value={shipment.cargo_type} />
          <DetailRow label="Slot Tier"   value={shipment.tier_id.toUpperCase()} />
          <DetailRow label="Pickup Date" value={shipment.pickup_date} />
          <DetailRow label="Sender"      value={shipment.sender_name} />
          <DetailRow label="Receiver"    value={shipment.receiver_name} />
          <DetailRow label="Amount"      value={formatNGN(shipment.amount_ngn)} />
          {shipment.escrow_enabled && (
            <DetailRow label="Escrow" value="🔒 Active" />
          )}
          {shipment.cardano_tx_hash && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Cardano TX</div>
              <code className="text-xs text-navy/60 font-mono break-all">
                {shipment.cardano_tx_hash}
              </code>
            </div>
          )}
        </motion.div>

        {/* Status History */}
        {slotEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-navy/6 mt-4"
          >
            <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
              Status History
            </div>
            <div className="space-y-3">
              {slotEvents.map((event) => {
                const ts = new Date(event.created_at).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
                return (
                  <div key={event.id} className="flex items-start gap-3 text-sm">
                    <span className="text-gray-400 whitespace-nowrap font-mono text-xs pt-0.5">{ts}</span>
                    <span className="text-navy/30">·</span>
                    <span className="font-semibold text-navy capitalize">
                      {event.status.replace('_', ' ')}
                    </span>
                    {event.note && (
                      <>
                        <span className="text-navy/30">—</span>
                        <span className="text-navy/60">{event.note}</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Proof of Delivery */}
        {shipment.status === 'delivered' && podData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-navy/6 mt-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold tracking-widest uppercase text-gray-400">
                Proof of Delivery
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Delivered
              </span>
            </div>

            {/* POD photo */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-gray-50">
              <Image
                src={podData.photo_url}
                alt="Proof of delivery photo"
                fill
                className="object-cover"
                sizes="(max-width: 672px) 100vw, 672px"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Received by</span>
                <span className="font-semibold text-navy">{podData.receiver_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Delivered at</span>
                <span className="font-semibold text-navy">
                  {new Date(podData.created_at ?? '').toLocaleString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Verified on Cardano */}
        {shipment.cardano_tx_hash && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-6 border mt-4"
            style={{ background: 'rgba(0,51,173,0.06)', borderColor: 'rgba(0,51,173,0.15)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-[#0033AD]">₳</span>
                <span className="text-xs font-bold tracking-widest uppercase text-[#0033AD]/70">
                  Verified on Cardano
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0033AD] bg-[#0033AD]/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0033AD]" />
                On-chain
              </span>
            </div>
            <p className="text-xs text-navy/50 mb-3">
              This delivery is anchored on the Cardano blockchain.
            </p>
            <div className="flex items-center justify-between gap-4">
              <code className="text-xs font-mono text-navy/60 truncate">
                {shipment.cardano_tx_hash.slice(0, 20)}…{shipment.cardano_tx_hash.slice(-8)}
              </code>
              <a
                href={`https://preprod.cardanoscan.io/transaction/${shipment.cardano_tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-xs font-medium text-[#0033AD] hover:underline"
              >
                View on Cardanoscan ↗
              </a>
            </div>
          </motion.div>
        )}

        {/* Realtime indicator */}
        <div className="text-center mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 bg-green-brand rounded-full animate-pulse-dot" />
          Live updates enabled
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-navy">{value}</span>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-navy mx-auto mb-3" />
        <p className="text-navy/50 text-sm">Loading shipment...</p>
      </div>
    </div>
  )
}

function ErrorState({ code, message }: { code: string; message: string | null }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">📦</div>
        <h2 className="font-display font-bold text-xl text-navy mb-2">
          Shipment not found
        </h2>
        <p className="text-navy/50 text-sm mb-6">
          {message || `No shipment found for code "${code}".`}
        </p>
        <a href="/track"
           className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-xl font-display font-bold text-sm hover:bg-navy-mid transition-all">
          Try another code
        </a>
      </div>
    </div>
  )
}
