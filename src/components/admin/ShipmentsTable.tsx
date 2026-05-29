'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
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

  // Status-update form state
  const [activeRow, setActiveRow]   = useState<string | null>(null)
  const [note, setNote]             = useState('')
  const [loading, setLoading]       = useState(false)
  const [rowError, setRowError]     = useState<string | null>(null)

  // POD form state
  const [podRow, setPodRow]               = useState<string | null>(null)
  const [podPhoto, setPodPhoto]           = useState<File | null>(null)
  const [podReceiverName, setPodReceiverName] = useState('')
  const [podNotes, setPodNotes]           = useState('')
  const [podLoading, setPodLoading]       = useState(false)
  const [podError, setPodError]           = useState<string | null>(null)

  // Toast
  const [toast, setToast]   = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  function openStatusRow(id: string, isActive: boolean) {
    setActiveRow(isActive ? null : id)
    setPodRow(null)
    setNote('')
    setRowError(null)
  }

  function openPodRow(id: string, isPodActive: boolean) {
    setPodRow(isPodActive ? null : id)
    setActiveRow(null)
    setPodPhoto(null)
    setPodReceiverName('')
    setPodNotes('')
    setPodError(null)
  }

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

  async function handlePODSubmit(shipment: AdminShipmentRow) {
    if (!podPhoto) { setPodError('Please select a photo'); return }
    if (!podReceiverName.trim()) { setPodError('Receiver name is required'); return }

    setPodLoading(true)
    setPodError(null)

    try {
      const fd = new FormData()
      fd.append('photo', podPhoto)
      fd.append('receiver_name', podReceiverName.trim())
      if (podNotes.trim()) fd.append('notes', podNotes.trim())

      const res = await fetch(`/api/admin/shipments/${shipment.id}/pod`, {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setPodError(data.error ?? 'Upload failed')
        return
      }

      setPodRow(null)
      showToast('Delivery confirmed')
      router.refresh()
    } catch {
      setPodError('Network error')
    } finally {
      setPodLoading(false)
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
    <>
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-ink border border-green-brand/30 text-white text-[13px] font-medium px-5 py-3 rounded-2xl shadow-2xl shadow-black/40">
          <span className="w-2 h-2 rounded-full bg-green-brand flex-shrink-0" />
          {toast}
        </div>
      )}

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
            const isActive    = activeRow === shipment.id
            const isPodActive = podRow === shipment.id
            const nextStatus  = NEXT_STATUS[shipment.status]
            const [year, month, day] = shipment.created_at.split('T')[0].split('-').map(Number)
            const dateStr = new Date(year, month - 1, day).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })

            return (
              <Fragment key={shipment.id}>
                {/* Main row */}
                <tr className={['border-b border-line', (isActive || isPodActive) ? 'bg-[rgba(13,27,62,0.02)]' : ''].join(' ')}>
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
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          onClick={() => openStatusRow(shipment.id, isActive)}
                          className="text-[12px] font-medium text-green-deep hover:text-ink transition-colors whitespace-nowrap"
                        >
                          {isActive ? 'Cancel' : 'Update status'}
                        </button>
                        {shipment.status === 'arrived' && (
                          <button
                            onClick={() => openPodRow(shipment.id, isPodActive)}
                            className="text-[12px] font-medium text-green-brand hover:text-green-deep transition-colors whitespace-nowrap"
                          >
                            {isPodActive ? 'Cancel' : 'Confirm Delivery'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[12px] text-muted">Final</span>
                    )}
                  </td>
                </tr>

                {/* Status update expansion */}
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

                {/* POD form expansion */}
                {isPodActive && shipment.status === 'arrived' && (
                  <tr className="border-b border-line bg-[rgba(13,27,62,0.02)]">
                    <td colSpan={8} className="px-6 py-6">
                      <div className="text-[11px] uppercase tracking-[0.14em] font-medium text-muted mb-4">
                        Proof of Delivery
                      </div>
                      <div className="flex flex-wrap items-end gap-4">

                        {/* Photo upload */}
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.14em] font-medium text-muted mb-1.5">
                            Delivery photo <span className="normal-case text-red-500">*</span>
                          </div>
                          <label className="inline-flex items-center gap-2 cursor-pointer border border-line-strong rounded-xl px-3.5 py-2 bg-white hover:border-ink transition-colors">
                            <span className="text-[13px] text-muted">
                              {podPhoto ? podPhoto.name : 'Choose photo…'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={e => setPodPhoto(e.target.files?.[0] ?? null)}
                            />
                          </label>
                          {podPhoto && (
                            <div className="mt-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={URL.createObjectURL(podPhoto)}
                                alt="POD preview"
                                className="h-20 w-auto rounded-lg border border-line object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Receiver name */}
                        <div className="flex-1 min-w-[180px] max-w-xs">
                          <div className="text-[11px] uppercase tracking-[0.14em] font-medium text-muted mb-1.5">
                            Receiver name <span className="normal-case text-red-500">*</span>
                          </div>
                          <input
                            type="text"
                            value={podReceiverName}
                            onChange={e => setPodReceiverName(e.target.value)}
                            placeholder="Full name of recipient"
                            className="w-full px-3.5 py-2 text-[13px] border border-line-strong rounded-xl bg-white text-ink placeholder:text-muted focus:outline-none focus:border-ink"
                          />
                        </div>

                        {/* Notes */}
                        <div className="flex-1 min-w-[200px] max-w-sm">
                          <div className="text-[11px] uppercase tracking-[0.14em] font-medium text-muted mb-1.5">
                            Notes (optional)
                          </div>
                          <textarea
                            value={podNotes}
                            onChange={e => setPodNotes(e.target.value)}
                            placeholder="e.g. Left at reception desk"
                            rows={2}
                            className="w-full px-3.5 py-2 text-[13px] border border-line-strong rounded-xl bg-white text-ink placeholder:text-muted focus:outline-none focus:border-ink resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handlePODSubmit(shipment)}
                            disabled={podLoading}
                            className="flex-shrink-0 inline-flex items-center gap-2 bg-green-brand text-white text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-green-deep transition-colors disabled:opacity-50"
                          >
                            {podLoading ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Uploading…
                              </>
                            ) : (
                              'Confirm Delivery'
                            )}
                          </button>

                          {podError && (
                            <span className="text-[12px] text-red-600">{podError}</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
