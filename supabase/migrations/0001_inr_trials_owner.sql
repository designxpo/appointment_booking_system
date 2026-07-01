-- ============================================================================
-- Slotnest — INR pricing, 7-day trials, owner-editable plan tiers
-- Idempotent. Safe to run on the live project (existing schema.sql applied).
-- ============================================================================

-- ── Trials ───────────────────────────────────────────────────────────────────
-- Every new business starts a 7-day full-access trial. While trial_ends_at is
-- in the future the account behaves as "Professional" (see lib/subscription.ts).
alter table public.profiles
  add column if not exists trial_ends_at timestamptz;

-- ── Owner-editable subscription tiers ─────────────────────────────────────────
-- Prices/caps/features live in the DB so the owner can change them from the
-- owner console without a redeploy. lib/plans.ts holds code defaults used as a
-- fallback + the source for feature gating. Publicly readable (pricing is
-- public); all writes go through the service role from the owner portal.
create table if not exists public.plan_configs (
  tier             plan_tier primary key,
  name             text    not null,
  price_inr        integer not null default 0,   -- monthly, whole rupees
  price_inr_yearly integer not null default 0,   -- yearly, whole rupees
  appointment_cap  integer,                       -- null = unlimited
  website_builder  boolean not null default false,
  features         jsonb   not null default '[]'::jsonb,
  tagline          text    not null default '',
  sort             integer not null default 0,
  is_active        boolean not null default true,
  updated_at       timestamptz not null default now()
);

alter table public.plan_configs enable row level security;

do $$ begin
  create policy "anyone reads plan configs"
    on public.plan_configs for select using (true);
exception when duplicate_object then null; end $$;

-- Seed the Standard INR ladder. `do nothing` so re-running never clobbers
-- edits the owner has made in the console.
insert into public.plan_configs
  (tier, name, price_inr, price_inr_yearly, appointment_cap, website_builder, features, tagline, sort)
values
  ('free', 'Free', 0, 0, 50, false,
   '["Up to 50 appointments / month","AI receptionist (Entropy)","Smart calendar & reminders","1 staff login","Email support"]'::jsonb,
   'For trying Slotnest out', 0),
  ('startup', 'Starter', 999, 9990, 500, true,
   '["500 appointments / month","Everything in Free","No-code website builder","WhatsApp & email confirmations","Lead capture & mini-CRM"]'::jsonb,
   'For growing local businesses', 1),
  ('professional', 'Professional', 2499, 24990, 5000, true,
   '["5,000 appointments / month","Everything in Starter","Custom AI tone & scripts","Analytics & insights","Priority support"]'::jsonb,
   'For busy multi-service teams', 2),
  ('enterprise', 'Business', 6999, 69990, null, true,
   '["Unlimited appointments","Everything in Professional","Multiple staff & locations","Dedicated onboarding","SLA & account manager"]'::jsonb,
   'For chains & high-volume brands', 3)
on conflict (tier) do nothing;
