import { supabase } from '@/lib/supabase-browser'
import type { Trip } from '@/types'

// ── Shipment helpers ──────────────────────────────────────────

export async function createShipment(data: Record<string, unknown>) {
  const { data: shipment, error } = await supabase
    .from('shipments')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return shipment
}

export async function getShipmentByCode(trackingCode: string) {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('tracking_code', trackingCode)
    .single()

  if (error) throw error
  return data
}

export async function updateShipmentStatus(
  id: string,
  status: string,
  extra?: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('shipments')
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Realtime subscription ─────────────────────────────────────

export function subscribeToShipment(
  trackingCode: string,
  callback: (shipment: Record<string, unknown>) => void
) {
  return supabase
    .channel(`shipment:${trackingCode}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'shipments',
        filter: `tracking_code=eq.${trackingCode}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe()
}

// ── Trip helpers ──────────────────────────────────────────────

export async function getAvailableTrips(
  origin: string,
  destination: string
): Promise<Trip[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('trips')
    .select('id, reference, origin, destination, departure_date, estimated_arrival, status, total_slots')
    .eq('origin', origin)
    .eq('destination', destination)
    .eq('status', 'scheduled')
    .gte('departure_date', today)
    .order('departure_date', { ascending: true })

  if (error) throw error
  return (data ?? []) as Trip[]
}

export async function getSlotAvailability(
  tripId: string
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('slots')
    .select('slot_tier')
    .eq('trip_id', tripId)
    .eq('status', 'available')

  if (error) throw error

  const counts: Record<string, number> = { micro: 0, half: 0, full: 0, bulk: 0 }
  for (const row of (data ?? []) as Array<{ slot_tier: string }>) {
    if (row.slot_tier in counts) counts[row.slot_tier]++
  }
  return counts
}

// ── Slot booking (atomic via Postgres function) ───────────────

export async function bookSlot(
  tripId: string,
  tier: string,
  userId: string | null,
  shipmentData: Record<string, unknown>
): Promise<{ bookingReference: string; slotId: string; slotNumber: number }> {
  const { data: rpcData, error: rpcError } = await supabase.rpc('reserve_slot', {
    p_trip_id: tripId,
    p_slot_tier: tier,
    p_merchant_id: userId,
  })

  if (rpcError) throw rpcError

  const { slot_id, slot_number, booking_reference } = (
    rpcData as Array<{ slot_id: string; slot_number: number; booking_reference: string }>
  )[0]

  const { data: shipment, error: shipmentError } = await supabase
    .from('shipments')
    .insert([{
      ...shipmentData,
      tracking_code: booking_reference,
      trip_id: tripId,
      user_id: userId,
    }])
    .select('id')
    .single()

  if (shipmentError) throw shipmentError

  const { error: bsError } = await supabase
    .from('booking_slots')
    .insert([{ slot_id, shipment_id: (shipment as { id: string }).id, booking_reference }])

  if (bsError) throw bsError

  return { bookingReference: booking_reference, slotId: slot_id, slotNumber: slot_number }
}
