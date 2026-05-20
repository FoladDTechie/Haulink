-- =========================================================
-- Haulink — Supabase Schema
-- Run this in your Supabase project: SQL Editor > New Query
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Merchants ────────────────────────────────────────────────
create table if not exists merchants (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  phone           text not null unique,
  email           text,
  reputation_score integer default 100,
  total_shipments  integer default 0,
  cardano_address  text,
  created_at      timestamptz default now()
);

-- ── Shipments ─────────────────────────────────────────────────
create table if not exists shipments (
  id              uuid primary key default uuid_generate_v4(),
  tracking_code   text not null unique,
  tier_id         text not null check (tier_id in ('micro','half','full','bulk')),
  origin          text not null,
  destination     text not null,
  cargo_type      text not null,
  pickup_date     date not null,
  cargo_notes     text,

  sender_name     text not null,
  sender_phone    text not null,
  receiver_name   text not null,
  receiver_phone  text not null,

  status          text not null default 'booked'
                  check (status in ('booked','collected','loaded','in_transit','arrived','delivered','disputed')),

  payment_method  text not null default 'card'
                  check (payment_method in ('card','ada','transfer')),
  payment_status  text not null default 'pending'
                  check (payment_status in ('pending','paid','escrowed','released')),
  escrow_enabled  boolean not null default false,
  amount_ngn      integer not null,

  cardano_tx_hash text,
  pod_photo_url   text,
  pod_receiver_name text,
  pod_timestamp   timestamptz,

  merchant_id     uuid references merchants(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Auth user linkage (run after initial schema creation) ────
alter table shipments add column if not exists user_id uuid references auth.users(id);
create index if not exists shipments_user_id_idx on shipments(user_id);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists shipments_tracking_code_idx on shipments(tracking_code);
create index if not exists shipments_status_idx on shipments(status);
create index if not exists shipments_merchant_id_idx on shipments(merchant_id);

-- ── Row Level Security ────────────────────────────────────────
alter table shipments enable row level security;
alter table merchants enable row level security;

-- Public can read shipments by tracking code (for tracking page)
create policy "Public can read shipment by tracking code"
  on shipments for select
  using (true);

-- Public can insert shipments (booking flow — no auth required for pilot)
create policy "Public can insert shipments"
  on shipments for insert
  with check (true);

-- Only service role can update (via your FastAPI or Supabase Edge Function)
create policy "Service role can update shipments"
  on shipments for update
  using (auth.role() = 'service_role');

-- ── Realtime ─────────────────────────────────────────────────
-- Enable realtime on shipments table
-- Go to: Supabase Dashboard > Database > Replication
-- Add shipments table to the replication publication

-- ── Seed demo data ────────────────────────────────────────────
insert into shipments (
  tracking_code, tier_id, origin, destination, cargo_type,
  pickup_date, sender_name, sender_phone, receiver_name, receiver_phone,
  status, payment_method, payment_status, escrow_enabled, amount_ngn
) values (
  'HL-UYO-0001', 'half', 'Uyo', 'Lagos', 'Palm Oil / Food Produce',
  current_date + interval '1 day',
  'Amara Okafor', '08012345678', 'Emeka Adeleke', '07087654321',
  'in_transit', 'ada', 'paid', true, 19500
);

-- =========================================================
-- Trips & Slots schema (run in Supabase SQL Editor)
-- =========================================================

/*
-- ── Trips ─────────────────────────────────────────────────────
create table if not exists trips (
  id               uuid primary key default uuid_generate_v4(),
  reference        text not null unique,
  origin           text not null,
  destination      text not null,
  departure_date   date not null,
  estimated_arrival date not null,
  status           text not null default 'scheduled'
                   check (status in ('scheduled','in_transit','completed','cancelled')),
  total_slots      integer not null default 16,
  operator_id      uuid,
  created_at       timestamptz default now()
);

-- ── Slots ─────────────────────────────────────────────────────
create table if not exists slots (
  id          uuid primary key default uuid_generate_v4(),
  trip_id     uuid not null references trips(id) on delete cascade,
  slot_number integer not null,
  slot_tier   text not null check (slot_tier in ('micro','half','full','bulk')),
  status      text not null default 'available'
              check (status in ('available','booked','occupied')),
  booking_id  uuid,
  created_at  timestamptz default now(),
  unique (trip_id, slot_number)
);

create index if not exists slots_trip_tier_status_idx on slots(trip_id, slot_tier, status);

-- ── Booking Slots ──────────────────────────────────────────────
create table if not exists booking_slots (
  id                uuid primary key default uuid_generate_v4(),
  slot_id           uuid not null references slots(id),
  shipment_id       uuid not null references shipments(id),
  booking_reference text not null,
  created_at        timestamptz default now()
);

-- Add trip_id to shipments
alter table shipments add column if not exists trip_id uuid references trips(id);

-- RLS
alter table trips enable row level security;
alter table slots enable row level security;
alter table booking_slots enable row level security;

create policy "Public can read trips"   on trips   for select using (true);
create policy "Public can read slots"   on slots   for select using (true);
create policy "Service role manages trips" on trips for all using (auth.role() = 'service_role');
create policy "Service role manages slots" on slots for all using (auth.role() = 'service_role');
create policy "Public insert booking_slots" on booking_slots for insert with check (true);
create policy "Public read booking_slots"  on booking_slots for select using (true);
*/

-- =========================================================
-- reserve_slot — atomic slot reservation (run in SQL Editor)
-- =========================================================

/*
CREATE OR REPLACE FUNCTION reserve_slot(
  p_trip_id uuid,
  p_slot_tier text,
  p_merchant_id uuid DEFAULT NULL
)
RETURNS TABLE (
  slot_id uuid,
  slot_number int,
  booking_reference text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot_id uuid;
  v_slot_number int;
  v_booking_ref text;
BEGIN
  -- Lock and find first available slot of requested tier
  SELECT id, slot_number INTO v_slot_id, v_slot_number
  FROM slots
  WHERE trip_id = p_trip_id
    AND slot_tier = p_slot_tier
    AND status = 'available'
  ORDER BY slot_number
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_slot_id IS NULL THEN
    RAISE EXCEPTION 'No available slots of tier % on this trip', p_slot_tier;
  END IF;

  -- Generate booking reference
  v_booking_ref := 'HLK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                   LPAD(FLOOR(RANDOM() * 9999)::text, 4, '0');

  -- Mark slot as booked
  UPDATE slots SET status = 'booked', booking_id = NULL
  WHERE id = v_slot_id;

  RETURN QUERY SELECT v_slot_id, v_slot_number, v_booking_ref;
END;
$$;
*/
