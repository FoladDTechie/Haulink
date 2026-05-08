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
