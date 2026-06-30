-- ============================================================================
-- FlowBookAI — database schema
-- Run in the Supabase SQL editor (or via the CLI) on a fresh project.
-- RLS policies live in rls.sql; storage buckets in storage.sql.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type appointment_status as enum
    ('booked', 'confirmed', 'completed', 'cancelled', 'no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_tier as enum ('free', 'startup', 'professional', 'enterprise');
exception when duplicate_object then null; end $$;

do $$ begin
  create type site_theme as enum ('classic', 'minimum', 'modern');
exception when duplicate_object then null; end $$;

-- ── Profiles / Clinics ───────────────────────────────────────────────────────
-- One row per business. id mirrors auth.users.id (1:1 with the owner account).
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  -- Owner's display name (profile page); business_name is the clinic/brand.
  full_name       text not null default '',
  business_name   text not null,
  subdomain       text not null unique
                  check (subdomain ~ '^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$'),
  industry        text not null,
  role            text not null,
  plan            plan_tier not null default 'free',
  -- Subscription period (crypto sub). null on the perpetual free plan.
  plan_started_at timestamptz,
  plan_expires_at timestamptz,
  -- Last verified on-chain payment, for audit/idempotency.
  last_tx_hash    text,
  created_at      timestamptz not null default now()
);

-- ── Services ─────────────────────────────────────────────────────────────────
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  clinic_id        uuid not null references public.profiles (id) on delete cascade,
  name             text not null,
  duration_minutes int  not null check (duration_minutes between 5 and 480),
  price            numeric(10,2),
  -- Cleanup/prep time after each appointment (dentist sterilization, tattoo
  -- setup, detailing turnaround). Blocks the calendar but isn't client-facing.
  buffer_minutes   int  not null default 0 check (buffer_minutes between 0 and 120),
  -- How many clients can share one slot (group yoga class = 10, dentist = 1).
  capacity         int  not null default 1 check (capacity between 1 and 500),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);
create index if not exists services_clinic_idx on public.services (clinic_id);

-- ── Appointments ─────────────────────────────────────────────────────────────
create table if not exists public.appointments (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references public.profiles (id) on delete cascade,
  service_id   uuid references public.services (id) on delete set null,
  client_name  text not null,
  client_email text not null,
  client_phone text,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  status        appointment_status not null default 'booked',
  notes         text,
  -- Where the booking came from: 'ai_chat' (widget), 'manual', 'reschedule'.
  source        text not null default 'ai_chat',
  reminder_sent boolean not null default false,
  -- Secret token for the client's self-service manage link (cancel/reschedule).
  manage_token  uuid not null default gen_random_uuid() unique,
  created_at    timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists appts_clinic_time_idx
  on public.appointments (clinic_id, starts_at);

-- ── Capacity-aware double-booking guard ─────────────────────────────────────
-- A plain exclusion constraint can't model group capacity (a yoga class with
-- 10 seats must allow 10 overlapping rows). This trigger enforces, atomically
-- per clinic (advisory xact lock serializes concurrent bookings):
--   * same service + identical slot → allowed up to services.capacity
--   * any other overlap with an active appointment → rejected
-- Raises SQLSTATE 23P01 (like the old exclusion constraint) so application
-- error handling stays unchanged.
create or replace function public.check_appointment_conflict()
returns trigger language plpgsql as $$
declare
  cap int;
  same_slot int;
  conflicts int;
begin
  if new.status not in ('booked', 'confirmed') then
    return new;
  end if;

  -- Serialize bookings per clinic for the rest of this transaction.
  perform pg_advisory_xact_lock(hashtext(new.clinic_id::text));

  select coalesce(s.capacity, 1) into cap
    from public.services s where s.id = new.service_id;
  if cap is null then cap := 1; end if;

  select count(*) into same_slot
    from public.appointments a
   where a.clinic_id = new.clinic_id
     and a.id <> new.id
     and a.status in ('booked', 'confirmed')
     and a.service_id is not distinct from new.service_id
     and a.starts_at = new.starts_at
     and a.ends_at = new.ends_at;
  if same_slot >= cap then
    raise exception 'capacity full for this slot' using errcode = '23P01';
  end if;

  select count(*) into conflicts
    from public.appointments a
   where a.clinic_id = new.clinic_id
     and a.id <> new.id
     and a.status in ('booked', 'confirmed')
     and tstzrange(a.starts_at, a.ends_at) && tstzrange(new.starts_at, new.ends_at)
     and not (a.service_id is not distinct from new.service_id
              and a.starts_at = new.starts_at
              and a.ends_at = new.ends_at);
  if conflicts > 0 then
    raise exception 'slot overlaps an existing appointment' using errcode = '23P01';
  end if;

  return new;
end $$;

-- Replace the old blanket exclusion constraint with the trigger.
alter table public.appointments drop constraint if exists appointments_no_overlap;
drop trigger if exists appointments_conflict_check on public.appointments;
create trigger appointments_conflict_check
  before insert or update of starts_at, ends_at, status, service_id
  on public.appointments
  for each row execute function public.check_appointment_conflict();

-- ── Settings (1:1 with clinic) ────────────────────────────────────────────────
create table if not exists public.settings (
  clinic_id             uuid primary key references public.profiles (id) on delete cascade,
  working_hours         jsonb not null default '[]'::jsonb,
  breaks                jsonb not null default '[]'::jsonb,
  blocked_dates         jsonb not null default '[]'::jsonb,
  slot_interval_minutes int not null default 15,
  -- IANA timezone the business operates in. Working hours/breaks are
  -- interpreted in THIS timezone, not UTC.
  timezone              text not null default 'UTC',
  -- Anti-abuse / operational windows: how soon and how far out clients may book.
  min_notice_minutes    int not null default 60   check (min_notice_minutes between 0 and 10080),
  max_advance_days      int not null default 60   check (max_advance_days between 1 and 365),
  updated_at            timestamptz not null default now()
);

-- ── AI receptionist config (1:1 with clinic) ──────────────────────────────────
create table if not exists public.ai_configs (
  clinic_id                uuid primary key references public.profiles (id) on delete cascade,
  instructions             text not null default '',
  faqs                     jsonb not null default '[]'::jsonb,
  tone                     text not null default 'warm',
  widget_color             text not null default '#6366f1',
  -- First message the visitor sees when the widget opens.
  welcome_message          text not null default '',
  session_duration_minutes int  not null default 30,
  updated_at               timestamptz not null default now()
);

-- ── Website / CMS data (1:1 with clinic) ───────────────────────────────────────
create table if not exists public.website_data (
  clinic_id       uuid primary key references public.profiles (id) on delete cascade,
  theme           site_theme not null default 'classic',
  hero_title      text not null default '',
  hero_subtitle   text not null default '',
  hero_image_url  text,
  -- Additional CMS images shown as a gallery on the public site.
  gallery_urls    jsonb not null default '[]'::jsonb,
  primary_color   text not null default '#4f46e5',
  about           text not null default '',
  social_links    jsonb not null default '[]'::jsonb,
  -- SEO head fields for the public site.
  seo_title       text not null default '',
  seo_description text not null default '',
  seo_keywords    text not null default '',
  -- Google Maps share link rendered as "Find us" on the public site.
  maps_url        text,
  -- Section visibility flags ({hero:true, about:true, stats:false, ...}).
  sections        jsonb not null default '{}'::jsonb,
  -- Headline numbers ([{label, value}]) e.g. "15+ years", "5k patients".
  stats           jsonb not null default '[]'::jsonb,
  -- Testimonials ([{name, text, rating}]).
  reviews         jsonb not null default '[]'::jsonb,
  -- Public-site FAQ accordion ([{question, answer}]) — separate from AI FAQs.
  site_faqs       jsonb not null default '[]'::jsonb,
  -- Contact block ({address, phone, email}).
  contact         jsonb not null default '{}'::jsonb,
  -- Bottom call-to-action banner.
  cta_heading     text not null default '',
  cta_subheading  text not null default '',
  -- Small badge pill above the hero headline ("Trusted by hundreds").
  hero_badge      text not null default '',
  -- Checkmark items under the hero buttons (["5-star rated", ...]).
  trust_items     jsonb not null default '[]'::jsonb,
  is_published    boolean not null default false,
  updated_at      timestamptz not null default now()
);

-- Realtime: let the dashboard subscribe to live changes (AI bookings appear
-- on the calendar without a manual refresh).
do $$ begin
  alter publication supabase_realtime add table public.appointments;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.leads;
exception when duplicate_object then null; end $$;

-- ── Leads / Clients (CRM) ──────────────────────────────────────────────────────
-- Every person who interacts is captured as a lead, whether or not they book.
-- Booking links the lead to its appointment(s). Per-industry the UI calls these
-- "Patients", "Tenants", "Clients", etc. (see lib/industries.ts).
do $$ begin
  create type lead_status as enum ('new', 'contacted', 'booked', 'lost');
exception when duplicate_object then null; end $$;

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references public.profiles (id) on delete cascade,
  name         text not null,
  email        text,
  phone        text,
  source       text not null default 'ai_chat',
  status       lead_status not null default 'new',
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists leads_clinic_idx on public.leads (clinic_id, created_at desc);
-- A lead is unique per (clinic, email) so repeat chats update rather than dupe.
-- Plain (not partial) so it can back an upsert ON CONFLICT; multiple NULL
-- emails are allowed since Postgres treats NULLs as distinct.
create unique index if not exists leads_clinic_email_uq
  on public.leads (clinic_id, email);

-- Link appointments back to the lead that produced them (optional).
alter table public.appointments
  add column if not exists lead_id uuid references public.leads (id) on delete set null;

-- ── Payments ledger ────────────────────────────────────────────────────────────
-- Every verified on-chain subscription payment, append-only. The UNIQUE tx_hash
-- is the replay guard: a hash can buy exactly one upgrade, ever (the previous
-- profiles.last_tx_hash check only remembered the most recent payment).
create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.profiles (id) on delete cascade,
  tx_hash     text not null unique,
  plan        plan_tier not null,
  amount_usdt numeric(12,2) not null,
  paid_at     timestamptz not null default now()
);
create index if not exists payments_clinic_idx on public.payments (clinic_id, paid_at desc);

-- ── Payment intents ─────────────────────────────────────────────────────────────
-- Binds an on-chain payment to a specific account. Each upgrade attempt gets a
-- UNIQUE one-time amount (plan price + random cent offset, e.g. 19.37 USDT).
-- Verification then requires an on-chain transfer of EXACTLY that amount, so a
-- stranger's historical transfer to the admin wallet can never be claimed as
-- someone else's payment. Intents are single-use and expire.
create table if not exists public.payment_intents (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.profiles (id) on delete cascade,
  plan        plan_tier not null,
  amount_usdt numeric(12,2) not null,
  status      text not null default 'pending' check (status in ('pending', 'used', 'expired')),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '2 hours'
);
create index if not exists payment_intents_clinic_idx
  on public.payment_intents (clinic_id, status, created_at desc);

-- ── New-user bootstrap ─────────────────────────────────────────────────────────
-- Profile creation itself happens in the onboarding server action (it needs
-- business_name/subdomain/industry, which aren't known at signup time).
