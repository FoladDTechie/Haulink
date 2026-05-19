import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const ORIGIN_CODES: Record<string, string> = {
  'Uyo': 'UY',
  'Calabar': 'CB',
  'Port Harcourt': 'PH',
  'Enugu': 'EN',
  'Kano': 'KN',
  'Aba': 'AB',
}

const DEST_CODES: Record<string, string> = {
  'Lagos': 'LG',
  'Abuja': 'AJ',
  'Ibadan': 'IB',
  'Onitsha': 'ON',
}

function makeTripReference(origin: string, destination: string, departureDate: string): string {
  const [, month, day] = departureDate.split('-')
  const orig = ORIGIN_CODES[origin] ?? origin.slice(0, 2).toUpperCase()
  const dest = DEST_CODES[destination] ?? destination.slice(0, 2).toUpperCase()
  return `${orig}-${dest}-${day}${month}`
}

interface Distribution {
  micro: number
  half: number
  full: number
  bulk: number
}

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    origin: string
    destination: string
    departureDate: string
    estimatedArrival: string
    distribution: Distribution
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { origin, destination, departureDate, estimatedArrival, distribution } = body

  if (!origin || !destination || !departureDate || !estimatedArrival) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const totalSlots =
    (distribution.micro ?? 0) +
    (distribution.half ?? 0) +
    (distribution.full ?? 0) +
    (distribution.bulk ?? 0)

  if (totalSlots === 0) {
    return NextResponse.json({ error: 'At least one slot required' }, { status: 400 })
  }

  const reference = makeTripReference(origin, destination, departureDate)

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert([{
      reference,
      origin,
      destination,
      departure_date: departureDate,
      estimated_arrival: estimatedArrival,
      status: 'scheduled',
      total_slots: totalSlots,
    }])
    .select('id, reference')
    .single()

  if (tripError) {
    return NextResponse.json({ error: tripError.message }, { status: 500 })
  }

  const tripRow = trip as { id: string; reference: string }

  // Generate individual slot rows
  const slots: Array<{
    trip_id: string
    slot_number: number
    slot_tier: string
    status: string
  }> = []

  let slotNumber = 1
  for (const tier of ['micro', 'half', 'full', 'bulk'] as const) {
    const count = distribution[tier] ?? 0
    for (let i = 0; i < count; i++) {
      slots.push({
        trip_id: tripRow.id,
        slot_number: slotNumber++,
        slot_tier: tier,
        status: 'available',
      })
    }
  }

  const { error: slotsError } = await supabase.from('slots').insert(slots)

  if (slotsError) {
    // Trip was created but slots failed — clean up
    await supabase.from('trips').delete().eq('id', tripRow.id)
    return NextResponse.json({ error: slotsError.message }, { status: 500 })
  }

  return NextResponse.json({ trip: tripRow, slotCount: totalSlots })
}
