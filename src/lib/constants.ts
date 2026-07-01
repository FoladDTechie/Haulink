import type { SlotTier, TradeRoute } from '@/types'

export const SLOT_TIERS: SlotTier[] = [
  {
    id: 'micro',
    name: 'Micro Slot',
    label: 'Micro',
    range: '1–4 boxes',
    boxMin: 1,
    boxMax: 4,
    description: 'Small traders, samples, test loads',
    pricePerBox: 7800,
    priceNGN: 7800,
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
    range: '5–12 boxes',
    boxMin: 5,
    boxMax: 12,
    description: 'SME traders, small farms, textiles',
    pricePerBox: 7200,
    priceNGN: 36000,
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
    range: '13–24 boxes',
    boxMin: 13,
    boxMax: 24,
    description: 'Distributors, agri-coops, bulk goods',
    pricePerBox: 6720,
    priceNGN: 87360,
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
    range: '25–48 boxes',
    boxMin: 25,
    boxMax: 48,
    description: 'Large cooperatives, export prep',
    pricePerBox: 6240,
    priceNGN: 156000,
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

export const CARGO_TYPES_WITH_BOX_ESTIMATES = [
  {
    id: 'palm_oil',
    label: 'Palm Oil (25L jerry cans)',
    unit: 'jerry cans',
    unitsPerBox: 7,
    category: 'agricultural',
  },
  {
    id: 'textiles',
    label: 'Textiles / Fabrics (cartons)',
    unit: 'cartons',
    unitsPerBox: 2,
    category: 'general',
  },
  {
    id: 'shea_butter',
    label: 'Shea Butter (50kg bags)',
    unit: 'bags',
    unitsPerBox: 2,
    category: 'agricultural',
  },
  {
    id: 'hibiscus',
    label: 'Hibiscus / Zobo (bags)',
    unit: 'bags',
    unitsPerBox: 3,
    category: 'agricultural',
  },
  {
    id: 'general_cartons',
    label: 'General Cartons',
    unit: 'cartons',
    unitsPerBox: 2,
    category: 'general',
  },
  {
    id: 'electronics',
    label: 'Electronics / Thrift (cartons)',
    unit: 'cartons',
    unitsPerBox: 2,
    category: 'general',
  },
  {
    id: 'furniture',
    label: 'Furniture / Large Items',
    unit: 'pieces',
    unitsPerBox: 1,
    category: 'heavy',
  },
  {
    id: 'beverages',
    label: 'Beverages / Drinks (cartons)',
    unit: 'cartons',
    unitsPerBox: 2,
    category: 'general',
  },
]

export const ROUTE_MULTIPLIERS: Record<string, number> = {
  'Uyo-Lagos': 1.00,
  'Calabar-Lagos': 1.15,
  'Port Harcourt-Lagos': 1.05,
  'Aba-Abuja': 1.05,
  'Enugu-Lagos': 1.00,
  'Kano-Lagos': 1.35,
}

export const BOX_DIMENSIONS = {
  width: 60,
  height: 60,
  depth: 60,
  unit: 'cm',
  cartonsEquivalent: 2.5,
}

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
// Read client-side via NEXT_PUBLIC_ prefix; falls back to the hardcoded rate if unset
export const ADA_NGN_RATE = Number(process.env.NEXT_PUBLIC_ADA_NGN_RATE) || 3000

export const APP_NAME = 'Haulink'
export const APP_TAGLINE = 'Containerizing trailer space for SMEs'
export const PILOT_ROUTE = 'Uyo → Lagos'
