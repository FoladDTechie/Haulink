'use client'

import Link from 'next/link'
import { Package } from 'lucide-react'
import { format } from 'date-fns'
import type { Shipment, ShipmentStatus } from '@/types'

interface StatusStyle {
  label: string
  classes: string
}

const STATUS_STYLES: Record<ShipmentStatus, StatusStyle> = {
  booked:     { label: 'Booked',     classes: 'bg-white/10 text-white/60' },
  collected:  { label: 'Collected',  classes: 'bg-blue-500/20 text-blue-300' },
  loaded:     { label: 'Loaded',     classes: 'bg-purple-500/20 text-purple-300' },
  in_transit: { label: 'In transit', classes: 'bg-amber-500/20 text-amber-300' },
  arrived:    { label: 'Arrived',    classes: 'bg-teal-500/20 text-teal-300' },
  delivered:  { label: 'Delivered',  classes: 'bg-green-brand/20 text-green-brand' },
  disputed:   { label: 'Disputed',   classes: 'bg-red-500/20 text-red-300' },
}

interface Props {
  shipments: Shipment[]
  userName: string
}

export function DashboardContent({ shipments, userName }: Props) {
  const firstName = userName.split(' ')[0]

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden font-grotesk">
      <div className="absolute inset-0 slot-grid-dark pointer-events-none" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-8 pt-14 pb-24">
        {/* Header */}
        <div className="mb-12">
          <div className="eyebrow mb-4 flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-brand"
              style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.2)' }}
            />
            Merchant dashboard
          </div>
          <h1
            className="font-grotesk font-medium leading-[0.95] tracking-[-0.045em] text-white"
            style={{ fontSize: 'clamp(40px, 5vw, 72px)' }}
          >
            {firstName}&apos;s{' '}
            <em className="font-serif-italic text-green-brand font-normal">shipments.</em>
          </h1>
        </div>

        {/* Table card */}
        <div className="bg-paper rounded-3xl border border-white/[0.06] shadow-2xl shadow-black/40 overflow-hidden">
          {shipments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-line">
                    {['Tracking code', 'Route', 'Tier', 'Status', 'Date'].map(col => (
                      <th
                        key={col}
                        className="px-6 py-4 text-[11px] tracking-[0.2em] uppercase font-medium text-muted whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shipments.map(s => (
                    <tr key={s.id} className="hover:bg-cream/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/track/${s.tracking_code}`}
                          className="font-mono text-[13px] font-semibold text-green-deep hover:text-green-brand transition-colors"
                        >
                          {s.tracking_code}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-ink whitespace-nowrap">
                        {s.origin}
                        <span className="text-green-deep mx-1.5">→</span>
                        {s.destination}
                      </td>
                      <td className="px-6 py-4 capitalize text-muted">{s.tier_id}</td>
                      <td className="px-6 py-4">
                        <StatusPill status={s.status} />
                      </td>
                      <td className="px-6 py-4 text-muted whitespace-nowrap">
                        {format(new Date(s.created_at), 'd MMM yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: ShipmentStatus }) {
  const cfg = STATUS_STYLES[status] ?? STATUS_STYLES.booked
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] tracking-[0.12em] uppercase font-medium ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-ink/10 flex items-center justify-center mb-6">
        <Package size={28} className="text-muted" />
      </div>
      <h3 className="font-grotesk font-medium text-[22px] tracking-[-0.025em] text-ink mb-3">
        No shipments yet.
      </h3>
      <p className="text-[14px] text-muted mb-8 max-w-[28ch] leading-relaxed">
        Book your first slot and your shipments will appear here.
      </p>
      <Link
        href="/book"
        className="inline-flex items-center gap-2.5 bg-ink text-white font-medium text-[13.5px] px-6 py-3 rounded-full hover:-translate-y-px hover:bg-green-deep transition-all"
      >
        Book your first slot
      </Link>
    </div>
  )
}
