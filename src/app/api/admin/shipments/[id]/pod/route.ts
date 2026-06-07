import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const photo = formData.get('photo') as File | null
  const receiverName = (formData.get('receiver_name') as string | null)?.trim()
  const notes = (formData.get('notes') as string | null)?.trim() || null

  if (!photo || !receiverName) {
    return NextResponse.json({ error: 'Photo and receiver name are required' }, { status: 400 })
  }

  const shipmentId = params.id

  // Verify shipment exists and is in 'arrived' state
  const { data: shipment, error: fetchError } = await supabase
    .from('shipments')
    .select('id, status, tracking_code')
    .eq('id', shipmentId)
    .single()

  if (fetchError || !shipment) {
    return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
  }

  if ((shipment as { id: string; status: string; tracking_code: string }).status !== 'arrived') {
    return NextResponse.json(
      { error: 'Shipment must be in arrived status to confirm delivery' },
      { status: 400 }
    )
  }

  // Get slot_id from booking_slots
  const { data: bookingSlots } = await supabase
    .from('booking_slots')
    .select('slot_id')
    .eq('shipment_id', shipmentId)

  const slotId = (bookingSlots ?? [])[0]?.slot_id ?? null

  // Upload photo to Supabase Storage
  const timestamp = Date.now()
  const filePath = `${shipmentId}/${timestamp}.jpg`

  const arrayBuffer = await photo.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('pod-photos')
    .upload(filePath, buffer, {
      contentType: photo.type || 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('pod-photos')
    .getPublicUrl(filePath)

  // Create pod_records row — slot_id may be null for older shipments
  const { data: podRecord, error: podError } = await supabase
    .from('pod_records')
    .insert([{
      slot_id: slotId,
      photo_url: publicUrl,
      receiver_name: receiverName,
      otp_confirmed: false,
    }])
    .select()
    .single()

  if (podError) {
    return NextResponse.json({ error: podError.message }, { status: 500 })
  }

  // Update shipment to delivered + store POD fields
  const now = new Date().toISOString()
  const { error: shipmentError } = await supabase
    .from('shipments')
    .update({
      status: 'delivered',
      pod_photo_url: publicUrl,
      pod_receiver_name: receiverName,
      pod_timestamp: now,
      updated_at: now,
    })
    .eq('id', shipmentId)

  if (shipmentError) {
    return NextResponse.json({ error: shipmentError.message }, { status: 500 })
  }

  // Update slot status and record event
  if (slotId) {
    await supabase
      .from('slots')
      .update({ status: 'delivered' })
      .eq('id', slotId)

    await supabase.from('slot_events').insert([{
      slot_id: slotId,
      status: 'delivered',
      note: notes,
      recorded_by: user.id,
    }])
  }

  const trackingCode = (shipment as { id: string; status: string; tracking_code: string }).tracking_code ?? shipmentId
  const podHash = createHash('sha256')
    .update(trackingCode + receiverName + now + publicUrl)
    .digest('hex')

  return NextResponse.json({
    success: true,
    pod_record: podRecord,
    public_url: publicUrl,
    pod_hash: podHash,
    shipment_id: shipmentId,
  })
}
