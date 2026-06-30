import Link from "next/link";
import { INDUSTRIES } from "@/lib/industries";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { DashboardMock } from "@/components/marketing/dashboard-mock";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink">
      {/* Ambient background: faint grid + radial brand glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_75%)]" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand/20 blur-[130px]" />
        <div className="absolute top-[60%] -left-40 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-[130px]" />
        <div className="absolute top-[120%] -right-40 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[130px]" />
      </div>

      <SiteNav />

      <main>
        <Hero />
        <IndustriesStrip />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative px-5 pt-32 sm:px-8 sm:pt-36">
      {/* Spotlight beams from the top */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] overflow-hidden">
        <div className="absolute left-[20%] top-[-260px] h-[520px] w-[120px] -rotate-[28deg] bg-gradient-to-b from-white/15 to-transparent blur-2xl" />
        <div className="absolute right-[22%] top-[-260px] h-[520px] w-[120px] rotate-[28deg] bg-gradient-to-b from-white/12 to-transparent blur-2xl" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <div className="flex justify-center animate-fade-up">
          <span className="badge-pill">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            AI receptionist for {INDUSTRIES.length}+ industries
          </span>
        </div>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight animate-fade-up sm:text-6xl">
          <span className="text-gradient">Turn Conversations Into</span>
          <br />
          <span className="text-gradient-brand">Booked Appointments.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-400 animate-fade-up sm:text-lg">
          Slotnest answers your clients, checks live availability, and books
          appointments around the clock — so you capture every lead while you
          focus on the work that matters.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 animate-fade-up sm:flex-row">
          <Link href="/signup" className="btn-gradient w-full justify-center sm:w-auto">
            Get Started
            <Arrow />
          </Link>
          <a href="#how-it-works" className="btn-outline w-full justify-center sm:w-auto">
            See how it works
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-500 animate-fade-up">
          Free plan forever · No card required · Live in minutes
        </p>
      </div>

      {/* Product mockup */}
      <div className="relative mx-auto mt-16 max-w-5xl animate-fade-up">
        <div aria-hidden className="absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[40px] bg-brand/10 blur-3xl" />
        <DashboardMock />
      </div>
    </section>
  );
}

/* ── Industries trust strip ────────────────────────────────────────────── */
function IndustriesStrip() {
  const items = INDUSTRIES.slice(0, 18);
  const loop = [...items, ...items];
  return (
    <section id="industries" className="mt-24 scroll-mt-24 px-5 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm text-gray-500">
          Trusted across <span className="text-gray-300">{INDUSTRIES.length}+ industries</span> — from
          clinics to studios to home services
        </p>
        <div className="mask-fade-x relative mt-8 overflow-hidden">
          <div className="flex w-max gap-3 animate-marquee">
            {loop.map((i, idx) => (
              <span
                key={`${i.id}-${idx}`}
                className="glass flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm text-gray-300"
              >
                <span className="text-base">{i.icon}</span>
                {i.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Features ──────────────────────────────────────────────────────────── */
function Features() {
  return (
    <section id="features" className="mt-32 scroll-mt-24 px-5 sm:px-8">
      <SectionIntro
        badge="Features"
        title={<>Powerful features to simplify <br className="hidden sm:block" />your scheduling</>}
        subtitle="Everything you need to capture leads and fill your calendar — driven by an AI that understands your business."
      />

      <div className="mx-auto mt-14 grid max-w-6xl gap-4 lg:grid-cols-3">
        {/* AI Receptionist — wide */}
        <FeatureCard className="lg:col-span-2" icon={<BotIcon />} title="AI receptionist that books for you"
          body="Entropy, powered by Anthropic Claude, chats with clients in natural language, answers questions, and books real appointments — no forms, no phone tag.">
          <div className="mt-5 space-y-2">
            <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-white/10 px-3 py-2 text-xs text-gray-200">
              Do you have anything Friday afternoon?
            </div>
            <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-brand/25 px-3 py-2 text-xs text-gray-100">
              Yes — 2:30 PM or 4:00 PM are open. Want me to book one?
            </div>
            <div className="flex w-fit items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400">
              <Check /> Appointment confirmed
            </div>
          </div>
        </FeatureCard>

        {/* Smart availability */}
        <FeatureCard icon={<ClockIcon />} title="Smart availability"
          body="Timezone-aware slots that respect your hours, breaks, buffers, and lead times.">
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["9:00", "9:30", "10:00", "11:30", "1:00", "2:30"].map((t, i) => (
              <span key={t} className={`rounded-lg border px-2 py-1.5 text-center text-xs ${i === 4 ? "border-brand bg-brand/20 text-white" : "border-white/10 bg-white/5 text-gray-400"}`}>
                {t}
              </span>
            ))}
          </div>
        </FeatureCard>

        {/* Industries */}
        <FeatureCard icon={<LayersIcon />} title={`${INDUSTRIES.length}+ industry templates`}
          body="Pick your field and labels, services, and AI tone adapt automatically — Patients, Tenants, Clients, and more.">
          <div className="mt-5 flex flex-wrap gap-2">
            {INDUSTRIES.slice(0, 7).map((i) => (
              <span key={i.id} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300">
                {i.icon} {i.name}
              </span>
            ))}
          </div>
        </FeatureCard>

        {/* Website builder — wide */}
        <FeatureCard className="lg:col-span-2" icon={<GlobeIcon />} title="Built-in booking website builder"
          body="Launch a branded site at yourname.slotnest.ai in minutes. Pick a theme, drop in your services, and start taking bookings — no developer needed.">
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-ink-overlay/60">
            <div className="flex items-center gap-1.5 border-b border-white/8 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-3 rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">
                brightsmile.slotnest.ai
              </span>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="h-3 w-24 rounded bg-white/20" />
                <div className="mt-2 h-2 w-40 rounded bg-white/10" />
                <div className="mt-1.5 h-2 w-32 rounded bg-white/10" />
                <div className="mt-3 h-7 w-24 rounded-lg bg-brand/60" />
              </div>
              <div className="rounded-lg bg-gradient-to-br from-brand/30 to-violet-500/10" />
            </div>
          </div>
        </FeatureCard>
      </div>

      {/* Secondary feature row */}
      <div className="mx-auto mt-4 grid max-w-6xl gap-4 sm:grid-cols-3">
        <MiniFeature icon={<UsersIcon />} title="Leads & CRM" body="Every conversation is captured as a lead — booked or not — so you can follow up and never lose a prospect." />
        <MiniFeature icon={<BellIcon />} title="Automated reminders" body="Email confirmations and reminders go out on their own, cutting no-shows without lifting a finger." />
        <MiniFeature icon={<ShieldIcon />} title="No double-booking" body="A per-business lock serializes bookings and respects seat capacity, so two clients never grab the same slot." />
      </div>
    </section>
  );
}

/* ── How it works ──────────────────────────────────────────────────────── */
const STEPS = [
  { n: "01", icon: <LayersIcon />, title: "Pick your industry", body: "Choose your field and role. Slotnest tailors labels, default services, and your AI receptionist's tone instantly.", tags: ["40+ industries", "Auto-setup"] },
  { n: "02", icon: <ClockIcon />, title: "Set hours & services", body: "Define your working hours, breaks, buffers, and services. Availability is calculated for you — timezone-safe.", tags: ["Working hours", "Buffers"] },
  { n: "03", icon: <GlobeIcon />, title: "Publish your site", body: "Pick a theme and publish a branded booking page at your own subdomain. Share the link or embed the widget.", tags: ["Branded site", "Embed widget"] },
  { n: "04", icon: <BotIcon />, title: "Let AI handle bookings", body: "Your AI receptionist chats, books, captures leads, and sends reminders 24/7 while you get back to work.", tags: ["24/7", "Reminders"] },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="mt-32 scroll-mt-24 px-5 sm:px-8">
      <SectionIntro
        badge="Work Process"
        title={<>Getting started with <br className="hidden sm:block" />Slotnest</>}
        subtitle="From sign-up to your first AI-booked appointment in four simple steps."
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-colors hover:border-brand/30">
            <div aria-hidden className="absolute -right-6 -top-6 text-7xl font-bold text-white/[0.04]">{s.n}</div>
            <div className="flex items-center justify-between">
              <span className="page-icon">{s.icon}</span>
              <span className="text-xs font-medium text-brand">Step {s.n}</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{s.body}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {s.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-400">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Testimonials ──────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "Our front desk used to miss calls all day. Now the AI books cleanings overnight and our no-shows dropped by half.", name: "Dr. Hannah Pearce", role: "Dentist · Bright Smile Dental", emoji: "🦷" },
  { quote: "I set up my booking site in an afternoon. Clients book themselves and I just show up — it pays for itself every week.", name: "Marco Bellini", role: "Barber · Fade Lab", emoji: "💈" },
  { quote: "It understands the difference between a viewing and a valuation, and routes each one correctly. Genuinely feels tailored.", name: "Priya Anand", role: "Agent · Anand Realty", emoji: "🏠" },
  { quote: "The lead capture alone is worth it. Every chat becomes a contact I can follow up with, even when they don't book.", name: "Sofia Reyes", role: "Coach · Reyes Wellness", emoji: "🌟" },
  { quote: "Timezone handling and reminders just work. Our international clients stopped showing up at the wrong hour.", name: "Daniel Okafor", role: "Consultant · Okafor Advisory", emoji: "📈" },
  { quote: "Switched from a clunky calendar tool. The AI conversations feel human and the dashboard is beautiful.", name: "Lena Brandt", role: "Therapist · Calm Practice", emoji: "🧠" },
];

function Testimonials() {
  return (
    <section id="testimonials" className="mt-32 scroll-mt-24 px-5 sm:px-8">
      <SectionIntro
        badge="Testimonials"
        title="Loved by busy professionals"
        subtitle="See why teams across dozens of industries let Slotnest run their front desk."
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-6">
            <Stars />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-gray-300">“{t.quote}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand/30 to-violet-500/20 text-base">{t.emoji}</span>
              <div>
                <div className="text-sm font-medium text-white">{t.name}</div>
                <div className="text-xs text-gray-500">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ── Pricing ───────────────────────────────────────────────────────────── */
function Pricing() {
  return (
    <section id="pricing" className="mt-32 scroll-mt-24 px-5 sm:px-8">
      <SectionIntro
        badge="Pricing"
        title="Simple, transparent pricing"
        subtitle="Start free, upgrade when you grow. Pay monthly in USDT via MetaMask — no contracts, cancel anytime."
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-4 lg:grid-cols-4">
        {PLAN_ORDER.map((tier) => {
          const p = PLANS[tier];
          const popular = tier === "professional";
          return (
            <div
              key={tier}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                popular
                  ? "border-brand/50 bg-gradient-to-b from-brand/12 to-transparent shadow-glow"
                  : "border-white/8 bg-white/[0.03]"
              }`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[11px] font-medium text-white">
                  Most popular
                </span>
              )}
              <div className="text-sm font-semibold text-white">{p.name}</div>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">
                  {p.priceUsdt === 0 ? "Free" : `$${p.priceUsdt}`}
                </span>
                {p.priceUsdt > 0 && <span className="mb-1.5 text-sm text-gray-500">/mo USDT</span>}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {p.appointmentCap === null
                  ? "Unlimited appointments"
                  : `Up to ${p.appointmentCap.toLocaleString()} appointments/mo`}
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-0.5 text-brand"><Check /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-6 w-full justify-center ${popular ? "btn-gradient" : "btn-outline"}`}
              >
                {tier === "enterprise" ? "Contact sales" : tier === "free" ? "Start free" : "Get started"}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Closing CTA ───────────────────────────────────────────────────────── */
function CtaBand() {
  return (
    <section className="mt-32 px-5 sm:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-brand/15 to-ink-raised px-6 py-16 text-center">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]" />
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
          Ready to never miss a booking again?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-gray-400">
          Join businesses across {INDUSTRIES.length}+ industries letting AI handle
          the front desk. Set up in minutes — free to start.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="btn-gradient w-full justify-center sm:w-auto">
            Get Started <Arrow />
          </Link>
          <Link href="/login" className="btn-outline w-full justify-center sm:w-auto">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Shared building blocks ────────────────────────────────────────────── */
function SectionIntro({ badge, title, subtitle }: { badge: string; title: React.ReactNode; subtitle: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="flex justify-center">
        <span className="badge-pill">{badge}</span>
      </div>
      <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-gradient sm:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base text-gray-400">{subtitle}</p>
    </div>
  );
}

function FeatureCard({
  className = "",
  icon,
  title,
  body,
  children,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-colors hover:border-brand/30 ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-20 h-40 bg-brand/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="page-icon">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-400">{body}</p>
      {children}
    </div>
  );
}

function MiniFeature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
      <span className="page-icon">{icon}</span>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-400">{body}</p>
    </div>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5 text-brand">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" />
        </svg>
      ))}
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────────────────── */
const ico = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
function Arrow() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>; }
function Check() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>; }
function BotIcon() { return <svg {...ico}><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 8V4M9 14h.01M15 14h.01M2 14h2M20 14h2" /></svg>; }
function ClockIcon() { return <svg {...ico}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>; }
function GlobeIcon() { return <svg {...ico}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" /></svg>; }
function LayersIcon() { return <svg {...ico}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></svg>; }
function UsersIcon() { return <svg {...ico}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></svg>; }
function BellIcon() { return <svg {...ico}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>; }
function ShieldIcon() { return <svg {...ico}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>; }
