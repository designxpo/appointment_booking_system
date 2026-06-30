import { BookingWidget } from "@/components/booking-widget";
import type { WebsiteData } from "@/lib/types";

/**
 * Public-site templates, all driven by site.sections visibility flags:
 *   hero · about · services · stats · reviews · faq · gallery · contact · cta
 *
 *  - modern  : 2026-grade landing page — sticky navbar, dark gradient hero
 *              with badge + trust bar, icon stat circles, card sections
 *  - classic : warm professional light layout, serif headings
 *  - minimum : whitespace, left-aligned, understated
 */

export interface SiteService {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
}

export interface SiteProps {
  site: WebsiteData;
  clinicId: string;
  businessName: string;
  accentColor: string;
  services: SiteService[];
  welcomeMessage?: string;
}

export function SiteTheme(props: SiteProps) {
  switch (props.site.theme) {
    case "minimum":
      return <MinimumTheme {...props} />;
    case "classic":
      return <ClassicTheme {...props} />;
    case "modern":
    default:
      return <ModernTheme {...props} />;
  }
}

/* ── Shared pieces ──────────────────────────────────────────────── */

const STAT_ICONS = ["👥", "⭐", "✦", "🕐", "🏆", "💙"];

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 12 5 5L20 7" />
    </svg>
  );
}

function SectionHeading({
  eyebrow,
  title,
  accent,
}: {
  eyebrow: string;
  title: string;
  accent: string;
}) {
  return (
    <div className="text-center">
      <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
        {eyebrow}
      </div>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
    </div>
  );
}

function BookSection(p: SiteProps) {
  return (
    <section id="book" className="bg-gray-50 px-6 py-16">
      <SectionHeading eyebrow="Online booking" title="Book your appointment" accent={p.accentColor} />
      <div className="mx-auto mt-8 flex h-[560px] max-w-md justify-center">
        <BookingWidget
          clinicId={p.clinicId}
          businessName={p.businessName}
          accentColor={p.accentColor}
          services={p.services}
          welcomeMessage={p.welcomeMessage}
        />
      </div>
    </section>
  );
}

function StatsBlock({ site, accentColor }: SiteProps) {
  if (!site.sections.stats || site.stats.length === 0) return null;
  return (
    <section id="stats" className="bg-white px-6 py-16">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-10 text-center md:grid-cols-4">
        {site.stats.map((s, i) => (
          <div key={i}>
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
            >
              {STAT_ICONS[i % STAT_ICONS.length]}
            </div>
            <div className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">{s.value}</div>
            <div className="mt-1 text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesBlock({ site, services, accentColor }: SiteProps) {
  if (!site.sections.services || services.length === 0) return null;
  return (
    <section id="services" className="bg-gray-50 px-6 py-16">
      <SectionHeading eyebrow="What we offer" title="Services" accent={accentColor} />
      <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div
            key={s.id}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
            >
              🗓
            </span>
            <h3 className="mt-4 text-lg font-bold text-gray-900">{s.name}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {s.duration_minutes} minutes{s.price != null ? ` · $${s.price}` : ""}
            </p>
            <a href="#book" className="mt-4 inline-block text-sm font-semibold" style={{ color: accentColor }}>
              Book now →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewsBlock({ site, accentColor }: SiteProps) {
  if (!site.sections.reviews || site.reviews.length === 0) return null;
  return (
    <section id="reviews" className="bg-white px-6 py-16">
      <SectionHeading eyebrow="Testimonials" title="What clients say" accent={accentColor} />
      <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
        {site.reviews.map((r, i) => (
          <figure key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <div className="text-amber-400">{"★".repeat(Math.max(1, Math.min(5, r.rating)))}</div>
            <blockquote className="mt-3 leading-relaxed text-gray-700">&ldquo;{r.text}&rdquo;</blockquote>
            <figcaption className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-500">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {r.name.charAt(0).toUpperCase()}
              </span>
              {r.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function FaqBlock({ site, accentColor }: SiteProps) {
  if (!site.sections.faq || site.site_faqs.length === 0) return null;
  return (
    <section id="faq" className="bg-gray-50 px-6 py-16">
      <SectionHeading eyebrow="Help" title="Frequently Asked Questions" accent={accentColor} />
      <p className="mt-2 text-center text-sm text-gray-500">Got a question? We&apos;ve got the answer.</p>
      <div className="mx-auto mt-8 max-w-2xl space-y-3">
        {site.site_faqs.map((f, i) => (
          <details key={i} className="group rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-gray-900">
              {f.question}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg transition-transform group-open:rotate-45"
                style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function GalleryBlock({ site, accentColor }: SiteProps) {
  if (!site.sections.gallery || !site.gallery_urls.length) return null;
  return (
    <section id="gallery" className="bg-white px-6 py-16">
      <SectionHeading eyebrow="Gallery" title="Take a look around" accent={accentColor} />
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {site.gallery_urls.map((url) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={url} src={url} alt="" loading="lazy" className="h-40 w-full rounded-2xl object-cover" />
        ))}
      </div>
    </section>
  );
}

function ContactBlock({ site, accentColor }: SiteProps) {
  const c = site.contact;
  const hasAny = c.address || c.phone || c.email || site.maps_url || site.social_links.length;
  if (!site.sections.contact || !hasAny) return null;
  return (
    <section id="contact" className="bg-gray-50 px-6 py-16">
      <SectionHeading eyebrow="Get in touch" title="Contact" accent={accentColor} />
      <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
        {c.address && <ContactCard icon="📍" label="Visit us" value={c.address} />}
        {c.phone && <ContactCard icon="📞" label="Call us" value={c.phone} />}
        {c.email && <ContactCard icon="✉️" label="Email us" value={c.email} />}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm font-medium">
        {site.maps_url && (
          <a href={site.maps_url} target="_blank" rel="noopener noreferrer" style={{ color: accentColor }}>
            Open in Google Maps →
          </a>
        )}
        {site.social_links.map((s) => (
          <a key={s.url} href={s.url} className="text-gray-500 hover:text-gray-800">
            {s.platform}
          </a>
        ))}
      </div>
    </section>
  );
}

function ContactCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-gray-800">{value}</div>
    </div>
  );
}

function CtaBlock({ site, accentColor }: SiteProps) {
  if (!site.sections.cta) return null;
  return (
    <section className="px-6 py-20 text-center text-white" style={{ backgroundColor: accentColor }}>
      <h2 className="text-4xl font-extrabold tracking-tight">
        {site.cta_heading || "Ready to get started?"}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-lg opacity-90">
        {site.cta_subheading ||
          "Book your appointment online in minutes — our AI assistant is available 24/7."}
      </p>
      {site.trust_items.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm">
          {site.trust_items.map((t) => (
            <span key={t} className="flex items-center gap-1.5 opacity-90">
              <CheckIcon /> {t}
            </span>
          ))}
        </div>
      )}
      <a
        href="#book"
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold shadow-xl transition-transform hover:scale-105"
        style={{ color: accentColor }}
      >
        📅 Book Now
      </a>
    </section>
  );
}

function Footer({ businessName }: { businessName: string }) {
  return (
    <footer className="bg-gray-950 px-6 py-8 text-center text-sm text-gray-400">
      <div className="font-semibold text-white">{businessName}</div>
      <div className="mt-1">
        © {new Date().getFullYear()} · Powered by <span className="text-gray-300">Slotnest</span>
      </div>
    </footer>
  );
}

function CommonSections(p: SiteProps) {
  return (
    <>
      <StatsBlock {...p} />
      <ServicesBlock {...p} />
      <ReviewsBlock {...p} />
      <GalleryBlock {...p} />
      <FaqBlock {...p} />
      <BookSection {...p} />
      <ContactBlock {...p} />
      <CtaBlock {...p} />
      <Footer businessName={p.businessName} />
    </>
  );
}

/* ── Navbar (modern + classic) ──────────────────────────────────── */

function Navbar(p: SiteProps) {
  const { site } = p;
  const links: { href: string; label: string; show: boolean }[] = [
    { href: "#about", label: "About", show: site.sections.about && !!site.about },
    { href: "#services", label: "Services", show: site.sections.services && p.services.length > 0 },
    { href: "#reviews", label: "Reviews", show: site.sections.reviews && site.reviews.length > 0 },
    { href: "#faq", label: "FAQ", show: site.sections.faq && site.site_faqs.length > 0 },
    { href: "#contact", label: "Contact", show: site.sections.contact },
  ];
  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: p.accentColor }}
          >
            ♥
          </span>
          <span className="text-lg font-bold tracking-tight text-gray-900">{p.businessName}</span>
        </a>
        <div className="hidden items-center gap-7 text-sm font-medium text-gray-600 md:flex">
          {links.filter((l) => l.show).map((l) => (
            <a key={l.href} href={l.href} className="hover:text-gray-900">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#book"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105"
          style={{ backgroundColor: p.accentColor }}
        >
          📅 Book Now
        </a>
      </div>
    </nav>
  );
}

/* ── MODERN — the 2026 flagship ─────────────────────────────────── */

function ModernTheme(p: SiteProps) {
  const { site } = p;
  return (
    <main className="min-h-screen bg-white font-sans">
      <Navbar {...p} />

      {site.sections.hero && (
        <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white">
          {/* Accent glow */}
          <div
            className="pointer-events-none absolute -top-40 right-0 h-[480px] w-[480px] rounded-full opacity-25 blur-3xl"
            style={{ backgroundColor: p.accentColor }}
          />
          <div
            className="pointer-events-none absolute -bottom-48 -left-24 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl"
            style={{ backgroundColor: p.accentColor }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.2fr_1fr]">
            <div>
              {site.hero_badge && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
                  ⭐ {site.hero_badge}
                </span>
              )}
              <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                {site.hero_title || p.businessName}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                {site.hero_subtitle ||
                  "Professional service tailored to your needs. Book your appointment today."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#book"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 font-bold text-slate-950 shadow-xl transition-transform hover:scale-105"
                >
                  Book Appointment →
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center rounded-2xl border border-white/25 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Learn More
                </a>
              </div>
              {site.trust_items.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                  {site.trust_items.map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <span style={{ color: p.accentColor }}>
                        <CheckIcon />
                      </span>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {site.hero_image_url && (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={site.hero_image_url}
                  alt=""
                  className="aspect-[4/5] w-full rounded-3xl border border-white/10 object-cover shadow-2xl"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {site.sections.about && site.about && (
        <section id="about" className="bg-white px-6 py-16">
          <SectionHeading eyebrow="About us" title={`Welcome to ${p.businessName}`} accent={p.accentColor} />
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-gray-600">
            {site.about}
          </p>
        </section>
      )}

      <CommonSections {...p} />
    </main>
  );
}

/* ── CLASSIC — warm professional ────────────────────────────────── */

function ClassicTheme(p: SiteProps) {
  const { site } = p;
  return (
    <main className="min-h-screen bg-white">
      <Navbar {...p} />
      {site.sections.hero && (
        <section className="border-b border-gray-100 bg-gray-50 px-6 py-20 text-center">
          {site.hero_badge && (
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-medium"
              style={{ backgroundColor: `${p.accentColor}14`, color: p.accentColor }}
            >
              ⭐ {site.hero_badge}
            </span>
          )}
          <h1 className="mx-auto mt-5 max-w-3xl font-serif text-5xl font-bold leading-tight text-gray-900">
            {site.hero_title || p.businessName}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">{site.hero_subtitle}</p>
          <a
            href="#book"
            className="mt-8 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-semibold text-white shadow-lg"
            style={{ backgroundColor: p.accentColor }}
          >
            📅 Book Appointment
          </a>
          {site.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.hero_image_url}
              alt=""
              className="mx-auto mt-10 max-h-80 rounded-3xl object-cover shadow-xl"
            />
          )}
        </section>
      )}
      {site.sections.about && site.about && (
        <section id="about" className="mx-auto max-w-2xl px-6 py-16 text-center">
          <SectionHeading eyebrow="About" title={`Welcome to ${p.businessName}`} accent={p.accentColor} />
          <p className="mt-6 font-serif text-lg leading-relaxed text-gray-700">{site.about}</p>
        </section>
      )}
      <CommonSections {...p} />
    </main>
  );
}

/* ── MINIMUM — quiet and clean ──────────────────────────────────── */

function MinimumTheme(p: SiteProps) {
  const { site } = p;
  return (
    <main className="min-h-screen bg-white">
      <Navbar {...p} />
      {site.sections.hero && (
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-24">
          {site.hero_badge && (
            <div className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: p.accentColor }}>
              {site.hero_badge}
            </div>
          )}
          <h1 className="mt-4 text-6xl font-light tracking-tight text-gray-900">
            {site.hero_title || p.businessName}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-500">{site.hero_subtitle}</p>
          <a href="#book" className="mt-8 inline-block border-b-2 pb-0.5 font-medium" style={{ borderColor: p.accentColor, color: p.accentColor }}>
            Book an appointment →
          </a>
        </section>
      )}
      {site.sections.about && site.about && (
        <section id="about" className="mx-auto max-w-3xl px-6 py-10">
          <p className="max-w-xl leading-relaxed text-gray-600">{site.about}</p>
        </section>
      )}
      <CommonSections {...p} />
    </main>
  );
}
