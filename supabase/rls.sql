-- ============================================================================
-- Slotnest — Row-Level Security policies
-- Run AFTER schema.sql.
--
-- Model:
--   * An authenticated business owner can read/write ONLY their own rows
--     (where clinic_id = auth.uid(), or id = auth.uid() for profiles).
--   * The PUBLIC booking site needs to read a clinic's services/settings/site
--     and create appointments. Public READ is allowed on published, non-PII
--     data. Public WRITE (creating an appointment) is intentionally NOT granted
--     to anon here — it is performed server-side with the service-role key after
--     availability + plan-cap validation, so visitors can't spam the table or
--     read other visitors' PII.
-- ============================================================================

alter table public.profiles      enable row level security;
alter table public.services      enable row level security;
alter table public.appointments  enable row level security;
alter table public.settings      enable row level security;
alter table public.ai_configs    enable row level security;
alter table public.website_data  enable row level security;
alter table public.leads         enable row level security;
alter table public.payments      enable row level security;

-- ── Profiles ──────────────────────────────────────────────────────────────────
create policy "owner reads own profile"
  on public.profiles for select using (id = auth.uid());
create policy "owner inserts own profile"
  on public.profiles for insert with check (id = auth.uid());
create policy "owner updates own profile"
  on public.profiles for update using (id = auth.uid());
-- NOTE: deliberately NO anon select. RLS can't hide columns, so a blanket
-- anon policy would leak every clinic's plan/billing metadata. All public
-- rendering (booking site, embed, AI) reads via the service role server-side.

-- ── Services ────────────────────────────────────────────────────────────────────
create policy "owner manages own services"
  on public.services for all
  using (clinic_id = auth.uid())
  with check (clinic_id = auth.uid());

-- ── Appointments ────────────────────────────────────────────────────────────────
-- Owner full control of their own appointments. No anon access — the public
-- booking path goes through the service-role server action.
create policy "owner manages own appointments"
  on public.appointments for all
  using (clinic_id = auth.uid())
  with check (clinic_id = auth.uid());

-- ── Settings ──────────────────────────────────────────────────────────────────
-- Owner only; the public availability path reads via the service role.
create policy "owner manages own settings"
  on public.settings for all
  using (clinic_id = auth.uid())
  with check (clinic_id = auth.uid());

-- ── AI config ──────────────────────────────────────────────────────────────────
-- Owner only. The receptionist runs server-side and reads config with the
-- service role; the raw config (instructions/FAQs) is never exposed to anon.
create policy "owner manages own ai config"
  on public.ai_configs for all
  using (clinic_id = auth.uid())
  with check (clinic_id = auth.uid());

-- ── Website data ────────────────────────────────────────────────────────────────
create policy "owner manages own website"
  on public.website_data for all
  using (clinic_id = auth.uid())
  with check (clinic_id = auth.uid());
-- Published sites render server-side via the service role; no anon select.

-- ── Leads ───────────────────────────────────────────────────────────────────────
-- Owner only. Leads are created server-side (service role) from the public chat,
-- so anon needs no access and visitor PII stays private.
create policy "owner manages own leads"
  on public.leads for all
  using (clinic_id = auth.uid())
  with check (clinic_id = auth.uid());

-- ── Payments ────────────────────────────────────────────────────────────────────
-- Owner can read their own payment history. Rows are inserted server-side
-- (service role) after on-chain verification — no client writes at all.
create policy "owner reads own payments"
  on public.payments for select
  using (clinic_id = auth.uid());
