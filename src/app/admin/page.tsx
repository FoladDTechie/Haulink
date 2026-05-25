import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Trip, ShipmentStatus } from '@/types'

export default async function AdminPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (!user || user.email !== adminEmail) {
    redirect('/')
  }

  const [{ data: trips }, { data: statusRows }] = await Promise.all([
    supabase
      .from('trips')
      .select('id, reference, origin, destination, departure_date, status, total_slots')
      .order('departure_date', { ascending: false }),
    supabase
      .from('shipments')
      .select('status'),
  ])

  const tripList = (trips ?? []) as Pick<Trip, 'id' | 'reference' | 'origin' | 'destination' | 'departure_date' | 'status' | 'total_slots'>[]
  const rows = (statusRows ?? []) as Array<{ status: ShipmentStatus }>

  const shipmentCounts = {
    total:      rows.length,
    inTransit:  rows.filter(r => r.status === 'in_transit').length,
    delivered:  rows.filter(r => r.status === 'delivered').length,
  }

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden font-grotesk">
      <div className="absolute inset-0 slot-grid-dark pointer-events-none" />

      <div className="relative z-10 max-w-[1240px] mx-auto px-8 py-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="eyebrow mb-4 flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-brand"
                style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.2)' }} />
              Admin
            </div>
            <h1 className="font-grotesk font-medium text-white leading-none tracking-[-0.04em] text-[56px]">
              Operations <em className="font-serif-italic text-green-brand font-normal">hub.</em>
            </h1>
          </div>
          <Link
            href="/admin/trips/new"
            className="inline-flex items-center gap-2.5 bg-green-brand text-ink font-medium text-[13.5px] px-6 py-3 rounded-full hover:-translate-y-px transition-all"
          >
            + New trip
          </Link>
        </div>

        {/* Quick nav cards */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {/* Trips — current page */}
          <div className="rounded-2xl px-6 py-5 border border-white/10 bg-white/5">
            <div className="text-[11px] tracking-[0.18em] uppercase font-medium mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Trip management
            </div>
            <div className="font-grotesk font-medium text-white text-[22px] tracking-[-0.03em] mb-1">
              {tripList.length} trip{tripList.length !== 1 ? 's' : ''}
            </div>
            <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Current page</div>
          </div>

          {/* Shipments — link */}
          <Link
            href="/admin/shipments"
            className="group rounded-2xl px-6 py-5 border border-white/10 bg-white/5 hover:border-green-brand/40 hover:bg-white/[0.08] transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] tracking-[0.18em] uppercase font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Shipment tracking
              </div>
              <span className="text-green-brand text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
            <div className="font-grotesk font-medium text-white text-[22px] tracking-[-0.03em] mb-2">
              {shipmentCounts.total} shipment{shipmentCounts.total !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <span>{shipmentCounts.inTransit} in transit</span>
              <span>·</span>
              <span>{shipmentCounts.delivered} delivered</span>
            </div>
          </Link>
        </div>

        {/* Trips table */}
        <div className="bg-paper rounded-3xl border border-white/[0.06] shadow-2xl shadow-black/40 overflow-hidden">
          {tripList.length === 0 ? (
            <div className="px-10 py-16 text-center">
              <p className="text-[13px] font-medium" style={{ color: 'rgba(13,27,62,0.45)' }}>
                No trips yet.{' '}
                <Link href="/admin/trips/new" className="text-green-deep hover:underline">
                  Create the first one.
                </Link>
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  {['Reference', 'Route', 'Departure', 'Slots', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[11px] tracking-[0.18em] uppercase font-medium text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tripList.map((trip, i) => {
                  const [year, month, day] = trip.departure_date.split('-').map(Number)
                  const dateStr = new Date(year, month - 1, day).toLocaleDateString('en-GB', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                  })
                  return (
                    <tr key={trip.id}
                      className={i < tripList.length - 1 ? 'border-b border-line' : ''}>
                      <td className="px-6 py-4 font-mono font-medium text-ink text-[13px]">
                        {trip.reference}
                      </td>
                      <td className="px-6 py-4 text-ink">
                        {trip.origin} → {trip.destination}
                      </td>
                      <td className="px-6 py-4 text-muted">{dateStr}</td>
                      <td className="px-6 py-4 text-muted">{trip.total_slots}</td>
                      <td className="px-6 py-4">
                        <span className={[
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
                          trip.status === 'scheduled'
                            ? 'bg-green-muted text-green-deep'
                            : trip.status === 'in_transit'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-100 text-gray-500',
                        ].join(' ')}>
                          <span className={[
                            'w-1.5 h-1.5 rounded-full',
                            trip.status === 'scheduled' ? 'bg-green-brand' : 'bg-current',
                          ].join(' ')} />
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
