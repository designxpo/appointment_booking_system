import Link from "next/link";
import { INDUSTRIES } from "@/lib/industries";
import { getActivePlans } from "@/lib/plans-data";
import type { Plan } from "@/lib/plans";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { DashboardMock } from "@/components/marketing/dashboard-mock";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { Bloom, Sparkle } from "@/components/marketing/decor";

export default async function HomePage() {
  const plans = await getActivePlans();
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink">
      {/* Ambient background: faint grid + vivid violet light blooms */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,#000_25%,transparent_72%)]" />
        <Bloom className="-top-48 left-1/2 h-[560px] w-[900px] -translate-x-1/2" color="rgba(124,121,246,0.32)" blur={140} />
        <Bloom className="top-[55%] -left-52 h-[480px] w-[480px]" color="rgba(99,102,241,0.16)" blur={140} />
        <Bloom className="top-[110%] -right-52 h-[520px] w-[520px]" color="rgba(139,92,246,0.18)" blur={150} />
      </div>

      <SiteNav />

      <main>
        <Hero />
        <IndustriesStrip />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing plans={plans} />
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
      {/* Spotlight beams + halo from the top */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden">
        {/* central soft halo */}
        <div className="absolute left-1/2 top-[-220px] h-[440px] w-[720px] -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]" />
        {/* two bright converging light beams */}
        <div className="absolute left-[16%] top-[-320px] h-[680px] w-[200px] -rotate-[24deg] bg-gradient-to-b from-white/30 via-brand/15 to-transparent blur-3xl" />
        <div className="absolute right-[16%] top-[-320px] h-[680px] w-[200px] rotate-[24deg] bg-gradient-to-b from-white/25 via-brand/15 to-transparent blur-3xl" />
        {/* thin crisp highlight streaks for the "light leak" feel */}
        <div className="absolute left-[24%] top-[-180px] h-[420px] w-[2px] -rotate-[24deg] bg-gradient-to-b from-white/50 to-transparent blur-[2px]" />
        <div className="absolute right-[24%] top-[-180px] h-[420px] w-[2px] rotate-[24deg] bg-gradient-to-b from-white/40 to-transparent blur-[2px]" />
      </div>

      {/* Sparkle accents around the headline */}
      <Sparkle className="left-[12%] top-[28%] hidden sm:block" size={20} delay={0} />
      <Sparkle className="right-[14%] top-[22%] hidden sm:block" size={14} delay={1.2} />
      <Sparkle className="left-[22%] top-[46%] hidden lg:block" size={12} delay={2.1} />
      <Sparkle className="right-[20%] top-[52%] hidden lg:block" size={18} delay={0.6} />

      <div className="relative mx-auto max-w-3xl text-center">
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
          Slotnest answers your customers on WhatsApp and your website, checks
          live availability, and books appointments around the clock — so you
          capture every lead while you focus on the work that matters.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 animate-fade-up sm:flex-row">
          <Link href="/signup" className="btn-gradient w-full justify-center sm:w-auto">
            Start 7-day free trial
            <Arrow />
          </Link>
          <a href="#pricing" className="btn-outline w-full justify-center sm:w-auto">
            See pricing
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-500 animate-fade-up">
          7-day free trial · No credit card · Built for Indian businesses
        </p>

        {/* Headline stats — leads with the number of industries we tailor for */}
        <div className="liquid-card is-quiet mx-auto mt-10 grid max-w-lg grid-cols-3 divide-x divide-white/[0.05] animate-fade-up">
          {[
            { value: `${INDUSTRIES.length}+`, label: "Industries & niches" },
            { value: "24/7", label: "AI receptionist" },
            { value: "<5 min", label: "To go live" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-5">
              <div className="text-3xl font-bold text-gradient-brand">{s.value}</div>
              <div className="mt-1 text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Product mockup floating on a vivid violet bloom */}
      <div className="relative mx-auto mt-16 max-w-5xl animate-fade-up">
        <div aria-hidden className="pointer-events-none absolute -inset-x-24 -top-24 bottom-[-15%] -z-10">
          <Bloom className="left-1/2 top-1/4 h-[70%] w-[80%] -translate-x-1/2" color="rgba(124,121,246,0.4)" blur={120} />
          <Bloom className="left-1/2 bottom-0 h-[45%] w-[60%] -translate-x-1/2" color="rgba(139,92,246,0.45)" blur={100} delay={2} />
          <Bloom className="left-[20%] top-1/2 h-[40%] w-[35%] -translate-x-1/2" color="rgba(99,102,241,0.35)" blur={110} delay={4} />
        </div>
        <DashboardMock />
      </div>
    </section>
  );
}

/* ── Industries trust strip ────────────────────────────────────────────── */
function IndustriesStrip() {
  // Two offset rows scrolling opposite directions to show the breadth.
  const half = Math.ceil(INDUSTRIES.length / 2);
  const rowA = INDUSTRIES.slice(0, half);
  const rowB = INDUSTRIES.slice(half);
  return (
    <section id="industries" className="mt-24 scroll-mt-24 px-5 sm:px-8">
      <div className="mx-auto max-w-6xl text-center">
        <div className="text-5xl font-bold tracking-tight text-gradient-brand sm:text-6xl">
          {INDUSTRIES.length}+
        </div>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
          industries &amp; niches tailored out of the box — from clinics and salons to
          law firms, studios, and home services. Labels, services, and AI tone adapt
          to each.
        </p>

        <div className="mask-fade-x relative mt-10 space-y-3 overflow-hidden">
          <Marquee items={[...rowA, ...rowA]} />
          <Marquee items={[...rowB, ...rowB]} reverse />
        </div>
      </div>
    </section>
  );
}

function Marquee({ items, reverse = false }: { items: typeof INDUSTRIES; reverse?: boolean }) {
  return (
    <div className={`flex w-max gap-3 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
      {items.map((i, idx) => (
        <span
          key={`${i.id}-${idx}`}
          className="glass flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm text-gray-300"
        >
          <span className="text-base">{i.icon}</span>
          {i.name}
        </span>
      ))}
    </div>
  );
}

/* ── Features ──────────────────────────────────────────────────────────── */
function Features() {
  return (
    <section id="features" className="relative mt-32 scroll-mt-24 px-5 sm:px-8">
      {/* Section light blooms behind the card grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Bloom className="left-[15%] top-[35%] h-[440px] w-[440px]" color="rgba(124,121,246,0.16)" blur={150} />
        <Bloom className="right-[10%] bottom-[10%] h-[460px] w-[460px]" color="rgba(139,92,246,0.16)" blur={150} />
      </div>

      <SectionIntro
        badge="Features"
        title={<>Powerful features to simplify <br className="hidden sm:block" />your scheduling</>}
        subtitle="Everything you need to capture leads and fill your calendar — driven by an AI that understands your business."
      />

      <div className="mx-auto mt-14 grid max-w-6xl gap-4 lg:grid-cols-3">
        {/* AI Receptionist — wide */}
        <FeatureCard className="lg:col-span-2" icon={<BotIcon />} title="AI receptionist that books for you"
          body="Entropy, our advanced conversational AI, chats with clients in natural language, answers questions, and books real appointments — no forms, no phone tag.">
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
          <div className="relative mt-5">
          <Bloom className="left-1/2 bottom-0 h-3/4 w-4/5 -translate-x-1/2" color="rgba(139,92,246,0.4)" blur={55} />
          <div className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-ink-overlay/70">
            <div className="flex items-center gap-1.5 px-3 py-2">
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
    <section id="how-it-works" className="relative mt-32 scroll-mt-24 px-5 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Bloom className="left-1/2 top-1/3 h-[400px] w-[700px] -translate-x-1/2" color="rgba(124,121,246,0.14)" blur={150} />
      </div>
      <SectionIntro
        badge="Work Process"
        title={<>Getting started with <br className="hidden sm:block" />Slotnest</>}
        subtitle="From sign-up to your first AI-booked appointment in four simple steps."
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="liquid-card is-quiet p-6">
            <div aria-hidden className="absolute -right-6 -top-6 text-7xl font-bold text-white/[0.05]">{s.n}</div>
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
    <section id="testimonials" className="relative mt-32 scroll-mt-24 px-5 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Bloom className="right-[12%] top-1/4 h-[420px] w-[420px]" color="rgba(139,92,246,0.14)" blur={150} />
        <Bloom className="left-[8%] bottom-[10%] h-[380px] w-[380px]" color="rgba(99,102,241,0.12)" blur={150} />
      </div>
      <SectionIntro
        badge="Testimonials"
        title="Loved by busy professionals"
        subtitle="See why teams across dozens of industries let Slotnest run their front desk."
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="liquid-card is-quiet flex flex-col p-6">
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
function Pricing({ plans }: { plans: Plan[] }) {
  return (
    <section id="pricing" className="relative mt-32 scroll-mt-24 px-5 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Bloom centered on the highlighted plan */}
        <Bloom className="left-1/2 top-1/3 h-[480px] w-[560px] -translate-x-1/2" color="rgba(124,121,246,0.2)" blur={140} />
      </div>
      <SectionIntro
        badge="Pricing"
        title="Simple pricing in ₹, built for India"
        subtitle="Start with a 7-day free trial — no card required. Pick monthly or save 2 months with annual. All prices exclude 18% GST."
      />
      <PricingCards plans={plans} />
    </section>
  );
}

/* ── Closing CTA ───────────────────────────────────────────────────────── */
function CtaBand() {
  return (
    <section className="mt-32 px-5 sm:px-8">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-b from-brand/15 to-ink-raised px-6 py-16 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Bloom className="-top-28 left-1/2 h-80 w-[640px] -translate-x-1/2" color="rgba(124,121,246,0.5)" blur={120} />
          <Bloom className="bottom-[-30%] left-1/2 h-72 w-[520px] -translate-x-1/2" color="rgba(139,92,246,0.4)" blur={110} />
        </div>
        <Sparkle className="left-[14%] top-10 hidden sm:block" size={18} />
        <Sparkle className="right-[16%] top-16 hidden sm:block" size={14} />
        <Sparkle className="right-[24%] bottom-12 hidden sm:block" size={20} />
        <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
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
    <div className={`liquid-card p-6 ${className}`}>
      <span className="page-icon">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-400">{body}</p>
      {children}
    </div>
  );
}

function MiniFeature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="liquid-card is-quiet p-6">
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
