'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ShipmentStatus } from '@/types'

const NEXT_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  booked:     'collected',
  collected:  'loaded',
  loaded:     'in_transit',
  in_transit: 'arrived',
  arrived:    'delivered',
}

const STATUS_STYLES: Record<string, string> = {
  booked:     'bg-gray-100 text-gray-600',
  collected:  'bg-blue-50 text-blue-700',
  loaded:     'bg-amber-50 text-amber-700',
  in_transit: 'bg-amber-50 text-amber-700',
  arrived:    'bg-blue-50 text-blue-700',
  delivered:  'bg-green-muted text-green-deep',
}

export interface AdminShipmentRow {
  id: string
  tracking_code: string
  tier_id: string
  origin: string
  destination: string
  cargo_type: string
  status: ShipmentStatus
  created_at: string
  merchant_id: string | null
  booking_slots: Array<{ slot_id: string }> | null
  merchants: { name: string } | null
}

interface Props {
  shipments: AdminShipmentRow[]
}

export function ShipmentsTable({ shipments }: Props) {
  const router = useRouter()
  const [activeRow, setActiveRow] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)

  async function handleUpdate(shipment: AdminShipmentRow) {
    const newStatus = NEXT_STATUS[shipment.status]
    if (!newStatus) return

    const slotId = shipment.booking_slots?.[0]?.slot_id

    setLoading(true)
    setRowError(null)

    try {
      const res = await fetch(`/api/admin/shipments/${shipment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: note.trim() || undefined,
          slot_id: slotId,
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setRowError(data.error ?? 'Update failed')
        return
      }

      setActiveRow(null)
      setNote('')
      router.refresh()
    } catch {
      setRowError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (shipments.length === 0) {
    return (
      <div className="px-10 py-16 text-center">
        <p className="text-[13px] font-medium" style={{ color: 'rgba(13,27,62,0.45)' }}>
          No shipments yet.
        </p>
      </div>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-line">
          {['Tracking Code', 'Route', 'Cargo', 'Tier', 'Status', 'Merchant', 'Date', ''].map(h => (
            <th key={h} className="px-6 py-4 text-left text-[11px] tracking-[0.18em] uppercase font-medium text-muted">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {shipments.map((shipment) => {
          const isActive = activeRow === shipment.id
          const nextStatus = NEXT_STATUS[shipment.status]
          const [year, month, day] = shipment.created_at.split('T')[0].split('-').map(Number)
          const dateStr = new Date(year, month - 1, day).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
          })

          return (
            <Fragment key={shipment.id}>
              <tr className={['border-b border-line', isActive ? 'bg-[rgba(13,27,62,0.02)]' : ''].join(' ')}>
                <td className="px-6 py-4 font-mono font-medium text-ink text-[13px]">
                  {shipment.tracking_code}
                </td>
                <td className="px-6 py-4 text-ink text-[13px]">
                  {shipment.origin} → {shipment.destination}
                </td>
                <td className="px-6 py-4 text-muted text-[13px] max-w-[140px] truncate">
                  {shipment.cargo_type}
                </td>
                <td className="px-6 py-4 text-muted text-[13px] uppercase">
                  {shipment.tier_id}
                </td>
                <td className="px-6 py-4">
                  <span className={[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
                    STATUS_STYLES[shipment.status] ?? 'bg-gray-100 text-gray-500',
                  ].join(' ')}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {shipment.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted text-[13px]">
                  {shipment.merchants?.name ?? '—'}
                </td>
                <td className="px-6 py-4 text-muted text-[13px]">{dateStr}</td>
                <td className="px-6 py-4">
                  {nextStatus ? (
                    <button
                      onClick={() => {
                        setActiveRow(isActive ? null : shipment.id)
                        setNote('')
                        setRowError(null)
                      }}
                      className="text-[12px] font-medium text-green-deep hover:text-ink transition-colors whitespace-nowrap"
                    >
                      {isActive ? 'Cancel' : 'Update status'}
                    </button>
                  ) : (
                    <span className="text-[12px] text-muted">Final</span>
                  )}
                </td>
              </tr>

              {isActive && nextStatus && (
                <tr className="border-b border-line bg-[rgba(13,27,62,0.02)]">
                  <td colSpan={8} className="px-6 py-5">
                    <div className="flex flex-wrap items-end gap-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.14em] font-medium text-muted mb-1.5">
                          Next status
                        </div>
                        <span className={[
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium',
                          STATUS_STYLES[nextStatus] ?? 'bg-gray-100 text-gray-600',
                        ].join(' ')}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {nextStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex-1 min-w-[200px] max-w-xs">
                        <div className="text-[11px] uppercase tracking-[0.14em] font-medium text-muted mb-1.5">
                          Note (optional)
                        </div>
                        <input
                          type="text"
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          placeholder="e.g. Collected at Aba depot"
                          className="w-full px-3.5 py-2 text-[13px] border border-line-strong rounded-xl bg-white text-ink placeholder:text-muted focus:outline-none focus:border-ink"
                        />
                      </div>

                      <button
                        onClick={() => handleUpdate(shipment)}
                        disabled={loading}
                        className="flex-shrink-0 inline-flex items-center gap-2 bg-ink text-white text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-green-deep transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Updating…' : `Mark as ${nextStatus.replace('_', ' ')}`}
                      </button>

                      {rowError && (
                        <span className="text-[12px] text-red-600">{rowError}</span>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}
