import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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

  const body = await req.json() as { cardano_tx_hash?: string; pod_hash?: string }
  const { cardano_tx_hash, pod_hash } = body

  if (!cardano_tx_hash) {
    return NextResponse.json({ error: 'cardano_tx_hash required' }, { status: 400 })
  }

  const shipmentId = params.id

  const { data: shipment, error } = await supabase
    .from('shipments')
    .update({ cardano_tx_hash })
    .eq('id', shipmentId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update pod_records if the shipment has a linked booking slot
  const { data: bookingSlots } = await supabase
    .from('booking_slots')
    .select('slot_id')
    .eq('shipment_id', shipmentId)

  const slotId = (bookingSlots ?? [])[0]?.slot_id
  if (slotId) {
    await supabase
      .from('pod_records')
      .update({ cardano_tx_hash })
      .eq('slot_id', slotId)
  }

  void pod_hash // accepted for future use; store via ALTER TABLE shipments ADD COLUMN pod_hash text

  return NextResponse.json({ success: true, shipment })
}
