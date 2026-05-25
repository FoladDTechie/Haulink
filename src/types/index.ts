// ── Slot Tiers ──────────────────────────────────────────────
export type TierId = 'micro' | 'half' | 'full' | 'bulk'

export interface SlotTier {
  id: TierId
  name: string
  label: string
  range: string
  description: string
  priceNGN: number
  escrowFeeNGN: number
  features: string[]
  popular?: boolean
  color: string
}

// ── Shipment ─────────────────────────────────────────────────
export type ShipmentStatus =
  | 'booked'
  | 'collected'
  | 'loaded'
  | 'in_transit'
  | 'arrived'
  | 'delivered'
  | 'disputed'

export interface ShipmentMilestone {
  status: ShipmentStatus
  label: string
  timestamp?: string
  note?: string
}

export interface Shipment {
  id: string
  tracking_code: string
  tier_id: TierId
  origin: string
  destination: string
  cargo_type: string
  pickup_date: string
  sender_name: string
  sender_phone: string
  receiver_name: string
  receiver_phone: string
  status: ShipmentStatus
  payment_method: 'card' | 'ada' | 'transfer'
  payment_status: 'pending' | 'paid' | 'escrowed' | 'released'
  escrow_enabled: boolean
  amount_ngn: number
  cardano_tx_hash?: string
  pod_photo_url?: string
  pod_receiver_name?: string
  pod_timestamp?: string
  user_id: string | null
  created_at: string
  updated_at: string
}

// ── Trip ─────────────────────────────────────────────────────
export interface Trip {
  id: string
  reference: string
  origin: string
  destination: string
  departure_date: string
  estimated_arrival: string
  status: string
  total_slots: number
}

// ── Booking Form State ────────────────────────────────────────
export interface BookingFormData {
  // Step 1 — Cargo
  tier_id: TierId
  trip_id: string
  trip_reference: string
  origin: string
  destination: string
  cargo_type: string
  pickup_date: string
  cargo_notes: string

  // Step 2 — People
  sender_name: string
  sender_phone: string
  receiver_name: string
  receiver_phone: string

  // Step 3 — Payment
  payment_method: 'card' | 'ada' | 'transfer'
  escrow_enabled: boolean
}

// ── Routes ────────────────────────────────────────────────────
export interface TradeRoute {
  id: string
  origin: string
  origin_state: string
  destination: string
  destination_state: string
  distance_km: number
  typical_days: number
  active: boolean
}

// ── Slot Event ───────────────────────────────────────────────
export interface SlotEvent {
  id: string
  slot_id: string
  status: ShipmentStatus
  note: string | null
  recorded_by: string | null
  created_at: string
}

// ── Merchant ──────────────────────────────────────────────────
export interface Merchant {
  id: string
  name: string
  phone: string
  email?: string
  reputation_score: number
  total_shipments: number
  cardano_address?: string
  created_at: string
}
