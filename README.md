# FlowBookAI

AI-powered, multi-industry smart appointment booking SaaS. An AI receptionist
("Entropy", powered by the Anthropic Claude API) handles scheduling and client
chat; businesses get a dynamic dashboard and a built-in CMS website builder.

## Stack

- **Next.js** (App Router) · TypeScript · Tailwind CSS
- **Supabase** — Postgres, Auth, Storage (with RLS)
- **Anthropic Claude** — the AI receptionist engine
- **Resend** — appointment confirmation emails
- **MetaMask / USDT** — crypto subscription billing

## Project layout

```
action/      Server actions: auth, onboarding, appointments, AI receptionist, billing, website
app/         Routes: landing, auth, onboarding, dashboard/*, public booking site, embed, API
components/  Sidebar, booking widget, editors, billing UI
lib/         Supabase clients, AI instructions/tools, availability engine, industries, plans, validation
supabase/    schema.sql, rls.sql, storage.sql
public/      widget.js embeddable loader
```

## Setup

1. **Install**
   ```bash
   npm install
   ```

2. **Environment** — copy `.env.example` to `.env.local` and fill in:
   - Supabase URL + anon + service-role keys
   - `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_MODEL`)
   - `RESEND_API_KEY` / `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_ADMIN_USDT_WALLET`, chain id, USDT contract address

3. **Database** — in the Supabase SQL editor, run in order:
   ```
   supabase/schema.sql
   supabase/rls.sql
   supabase/storage.sql
   ```

4. **Run**
   ```bash
   npm run dev
   ```

## Key flows

- **Onboarding** picks an industry → role from `lib/industries.ts`, which drives
  dynamic dashboard labels (e.g. "Patients" vs "Tenants") everywhere.
- **AI booking**: the widget calls `/api/receptionist`, which runs Claude with
  `check_availability` / `book_appointment` tools. Availability is always
  re-validated server-side (`lib/availability.ts`); bookings are guarded by plan
  caps and a Postgres exclusion constraint against double-booking.
- **Billing**: `lib/metamask.ts` builds an ERC-20 USDT transfer; `activatePlan`
  records the tx hash. **TODO:** verify the transfer on-chain before upgrading.

## Scheduled jobs

All cron endpoints live under `/api/cron/*` and are guarded by `CRON_SECRET`
(`Authorization: Bearer <CRON_SECRET>`). They fail **closed** in production: if
`CRON_SECRET` is unset they return `503` rather than running unauthenticated.
Wire them to any scheduler (Vercel Cron, DigitalOcean App Platform, a GitHub
Actions `schedule`, or plain `cron` + `curl`):

| Endpoint                     | Suggested cadence | Purpose                                                              |
|:-----------------------------|:------------------|:--------------------------------------------------------------------|
| `/api/cron/reminders`        | hourly            | Email reminders for appointments starting in the next ~24h.         |
| `/api/cron/expire-plans`     | daily             | Downgrade paid plans whose `plan_expires_at` has passed.            |
| `/api/cron/cleanup-intents`  | daily             | Delete used/expired `payment_intents` so the table can't grow unbounded. |

## Deployment hardening

- **Trust the proxy, not the client.** `/api/receptionist` rate-limits on the
  **last** `X-Forwarded-For` hop (the one your edge/reverse proxy appends),
  because the left-most XFF value is client-supplied and spoofable. For this to
  hold, your reverse proxy (Vercel/Cloudflare/Nginx/load balancer) **must strip
  any inbound `X-Forwarded-For` / `X-Real-IP` headers** and set its own before
  the request reaches the app. A clinic-wide rate cap backstops spend even if a
  single IP is spoofed. Crawler metadata (`/sitemap.xml`, `/robots.txt`) is
  served on every host, including tenant subdomains.

## Notable scaffold TODOs

- On-chain verification of USDT payments (`action/billing.ts`).
- Full daily/weekly/monthly calendar grid (current view is a grouped list).
- Generate Supabase types: `supabase gen types typescript`.
- Map `<subdomain>.flowbook.ai` → `/site/<subdomain>` at DNS/edge.
