import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { ShipmentStatus } from '@/types'

const NEXT_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  booked:     'collected',
  collected:  'loaded',
  loaded:     'in_transit',
  in_transit: 'arrived',
  arrived:    'delivered',
}

const SLOT_STATUS: Partial<Record<ShipmentStatus, string>> = {
  booked:     'booked',
  collected:  'booked',
  loaded:     'loaded',
  in_transit: 'in_transit',
  arrived:    'arrived',
  delivered:  'delivered',
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { status: ShipmentStatus; note?: string; slot_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status: newStatus, note, slot_id } = body
  const { id: shipmentId } = params

  const { data: shipment, error: fetchError } = await supabase
    .from('shipments')
    .select('id, status')
    .eq('id', shipmentId)
    .single()

  if (fetchError || !shipment) {
    return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
  }

  const currentStatus = (shipment as { id: string; status: ShipmentStatus }).status
  const validNext = NEXT_STATUS[currentStatus]

  if (!validNext || validNext !== newStatus) {
    return NextResponse.json(
      { error: `Invalid transition: ${currentStatus} → ${newStatus}` },
      { status: 400 }
    )
  }

  const { data: updated, error: updateError } = await supabase
    .from('shipments')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', shipmentId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (slot_id) {
    const slotStatus = SLOT_STATUS[newStatus]
    if (slotStatus) {
      await supabase.from('slots').update({ status: slotStatus }).eq('id', slot_id)
    }
    await supabase.from('slot_events').insert([{
      slot_id,
      status: newStatus,
      note: note ?? null,
      recorded_by: user.id,
    }])
  }

  return NextResponse.json({ shipment: updated })
}
