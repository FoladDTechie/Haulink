import type { SlotTier, TradeRoute } from '@/types'

export const SLOT_TIERS: SlotTier[] = [
  {
    id: 'micro',
    name: 'Micro Slot',
    label: 'Micro',
    range: '1–5 cartons',
    description: 'Small traders, samples, test loads',
    priceNGN: 8500,
    escrowFeeNGN: 800,
    color: '#8A93A6',
    features: [
      'Tracking code & SMS alerts',
      'Basic proof of delivery',
      'Public tracking page',
    ],
  },
  {
    id: 'half',
    name: 'Half Slot',
    label: 'Half',
    range: '6–20 cartons',
    description: 'SME traders, small farms, textiles',
    priceNGN: 18000,
    escrowFeeNGN: 1500,
    color: '#2ECC52',
    popular: true,
    features: [
      'Priority loading',
      'Escrow protection option',
      'Verified POD + photo',
      'Cardano on-chain record',
    ],
  },
  {
    id: 'full',
    name: 'Full Slot',
    label: 'Full',
    range: '21–50 cartons',
    description: 'Distributors, agri-coops, bulk goods',
    priceNGN: 32000,
    escrowFeeNGN: 2500,
    color: '#0D1B3E',
    features: [
      'Dedicated trailer section',
      'Escrow included',
      'Full POD with photos',
      'Reputation record',
    ],
  },
  {
    id: 'bulk',
    name: 'Bulk Slot',
    label: 'Bulk',
    range: '50+ cartons',
    description: 'Large cooperatives, export prep',
    priceNGN: 55000,
    escrowFeeNGN: 4000,
    color: '#162952',
    features: [
      'Full trailer priority',
      'Escrow + insurance',
      'API access',
      'Dedicated support',
    ],
  },
]

export const TRADE_ROUTES: TradeRoute[] = [
  { id: 'uyo-lagos', origin: 'Uyo', origin_state: 'Akwa Ibom', destination: 'Lagos', destination_state: 'Lagos', distance_km: 580, typical_days: 2, active: true },
  { id: 'cal-lagos', origin: 'Calabar', origin_state: 'Cross River', destination: 'Lagos', destination_state: 'Lagos', distance_km: 650, typical_days: 2, active: true },
  { id: 'phc-lagos', origin: 'Port Harcourt', origin_state: 'Rivers', destination: 'Lagos', destination_state: 'Lagos', distance_km: 540, typical_days: 2, active: true },
  { id: 'enu-lagos', origin: 'Enugu', origin_state: 'Enugu', destination: 'Lagos', destination_state: 'Lagos', distance_km: 480, typical_days: 1, active: true },
  { id: 'kano-lagos', origin: 'Kano', origin_state: 'Kano', destination: 'Lagos', destination_state: 'Lagos', distance_km: 1120, typical_days: 3, active: true },
  { id: 'uyo-abj', origin: 'Uyo', origin_state: 'Akwa Ibom', destination: 'Abuja', destination_state: 'FCT', distance_km: 520, typical_days: 2, active: true },
]

export const CARGO_TYPES = [
  'Palm Oil / Food Produce',
  'Textiles / Fabrics',
  'Electronics / Thrift (Okrika)',
  'Shea Butter / Hibiscus',
  'Agricultural Produce',
  'Furniture / Heavy Goods',
  'General Cartons',
  'Beverages / Drinks',
]

export const SHIPMENT_MILESTONES = [
  { status: 'booked', label: 'Booking Confirmed' },
  { status: 'collected', label: 'Cargo Collected' },
  { status: 'loaded', label: 'Loaded onto Trailer' },
  { status: 'in_transit', label: 'In Transit' },
  { status: 'arrived', label: 'Arrived at Destination' },
  { status: 'delivered', label: 'Delivered & Confirmed' },
] as const

// ADA/NGN approximate rate — replace with live API in production
export const ADA_NGN_RATE = 570

export const APP_NAME = 'Haulink'
export const APP_TAGLINE = 'Containerizing trailer space for SMEs'
export const PILOT_ROUTE = 'Uyo → Lagos'
