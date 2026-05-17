import { supabase } from '@/lib/supabase-browser'

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
