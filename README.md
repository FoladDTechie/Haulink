# Haulink


> Containerizing trailer space for SMEs. Book. Pay. Track. Deliver.

Built for the **Gimbalabs Piece of Pie Hackathon** — Week 1.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + custom brand tokens |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth | Supabase Auth (add when needed) |
| Cardano payments | Mesh SDK (`@meshsdk/core`) |
| Deployment | Vercel (frontend) |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_ORG/haulink.git
cd haulink
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase-schema.sql`
3. Enable **Realtime** for the `shipments` table:
   - Dashboard → Database → Replication → Add `shipments`
4. Copy your project URL and anon key from **Settings → API**

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_HAULINK_WALLET_ADDRESS=addr1_your_cardano_address
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (Hero, Problem, How It Works, Pricing, CTA)
│   ├── book/page.tsx         # Multi-step booking flow
│   ├── track/page.tsx        # Tracking code search
│   └── track/[code]/page.tsx # Live shipment tracking (Supabase realtime)
├── components/
│   ├── layout/
│   │   └── Navbar.tsx
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── TrailerVisual.tsx  # Animated SVG
│   │   └── PricingSection.tsx
│   └── booking/
│       ├── StepCargo.tsx      # Step 1: Route + cargo type
│       ├── StepPeople.tsx     # Step 2: Sender + receiver
│       ├── StepPayment.tsx    # Step 3: Card / ADA / Transfer + escrow
│       ├── StepConfirmed.tsx  # Step 4: Success + tracking code
│       └── StepIndicator.tsx  # Progress dots
├── hooks/
│   ├── useBookingForm.ts      # All booking state + Supabase submit
│   └── useCardanoPayment.ts   # Mesh SDK wallet connect + send
├── lib/
│   ├── constants.ts           # Slot tiers, routes, cargo types
│   ├── supabase.ts            # Supabase client + helpers
│   └── utils.ts               # Formatters, tracking code generator
└── types/
    └── index.ts               # TypeScript types for all domain objects
```

---

## Cardano Integration

### What's wired up (Mesh SDK)
- Detect available wallets (Nami, Eternl, Lace, Yoroi)
- Connect wallet + get address
- Send ADA to Haulink receiving address
- Attach shipment memo as TX metadata (CIP-0020 key 674)
- Capture `txHash` and store with shipment record

### Install a Cardano wallet to test
- [Nami](https://namiwallet.io/) — Chrome extension
- [Eternl](https://eternl.io/) — Chrome/Firefox
- [Lace](https://www.lace.io/) — Chrome

### For real escrow (post-hackathon)
Write a Plutus/Aiken smart contract that:
1. Locks ADA on booking
2. Requires a signed delivery confirmation to release
3. Allows dispute within N days

---

## Deployment

```bash
# Push to GitHub
git push origin main

# Deploy to Vercel
npx vercel
```

Add your `.env.local` variables in Vercel project settings.

---

## Week-by-Week Build Plan

| Week | Web Dev | Backend Dev |
|---|---|---|
| 1–2 | Landing page + booking UI shell | Supabase schema + Supabase client |
| 3–4 | Full booking flow + tier selection | Shipment create/read API |
| 5–6 | Checkout + payment UI | Mesh SDK integration |
| 7–8 | Tracking page (realtime) | Admin state machine |
| 9–10 | POD confirmation screen | POD upload + Cardano tx metadata |
| 11–12 | Polish + deploy | Seed demo data + load testing |

---

## Brand Tokens

```css
--navy:       #0D1B3E   /* Primary */
--navy-mid:   #162952   /* Hover states */
--green:      #2ECC52   /* Accent / CTA */
--green-dark: #1fa33e   /* Green hover */
--cream:      #F5F2EC   /* Background */
--sand:       #EDE8DF   /* Alternate bg */
```

---

## Team

| Role | Responsibilities |
|---|---|
| Social Media & Ops | Weekly tweets, demo coordination, pilot ops |
| Backend Dev | Supabase schema, APIs, Cardano integration, admin state machine |
| Web Dev | Next.js UI, Framer Motion animations, Vercel deploy |

---

## Hackathon Links

- Public repo: [github.com/YOUR_ORG/haulink](https://github.com)
- Live app: [haulink.vercel.app](https://vercel.app)
- Weekly tweets: `#gimbalabs #pieceofpie #hackathon @gimbalabs`

Haulink helps SMEs and farmers ship like large distributors do. We turn trailer space into standardized, bookable logistics units and use Cardano for payments, escrow, and proof of delivery.
