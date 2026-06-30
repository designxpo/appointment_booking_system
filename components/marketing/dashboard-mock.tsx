import { Logo } from "./logo";

/**
 * Static, pixel-styled mock of the FlowBookAI dashboard used as the hero visual.
 * Pure markup + an inline SVG chart — no images, no client JS. Fully responsive:
 * the sidebar and side panel collapse on small screens instead of scrolling.
 */
export function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-raised/90 shadow-lift backdrop-blur-xl">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Logo className="h-5 w-5" />
          <span className="text-sm font-semibold text-white">FlowBookAI</span>
          <span className="ml-1 hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-300 sm:inline-flex">
            <span className="grid h-4 w-4 place-items-center rounded bg-brand/30 text-[9px]">🦷</span>
            Bright Smile Dental
            <Chevron />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-500 sm:flex">
            <Search /> Search…
          </div>
          <span className="chip bg-brand-muted text-brand">Pro</span>
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand to-indigo-400" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[190px_1fr]">
        {/* Sidebar */}
        <aside className="hidden flex-col gap-1 border-r border-white/8 p-3 lg:flex">
          {[
            { icon: <GridIcon />, label: "Dashboard", active: true },
            { icon: <CalIcon />, label: "Appointments", active: false },
            { icon: <UsersIcon />, label: "Clients", active: false },
            { icon: <BotIcon />, label: "AI Receptionist", active: false },
            { icon: <GlobeIcon />, label: "Website", active: false },
            { icon: <CardIcon />, label: "Billing", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs ${
                item.active
                  ? "bg-brand/15 text-white"
                  : "text-gray-400"
              }`}
            >
              <span className={item.active ? "text-brand" : "text-gray-500"}>{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div className="mt-auto rounded-xl border border-brand/20 bg-brand/10 p-3">
            <div className="text-xs font-semibold text-white">Upgrade plan</div>
            <div className="mt-1 text-[11px] leading-snug text-gray-400">
              Unlock unlimited bookings &amp; custom AI tone.
            </div>
            <div className="mt-2 rounded-lg bg-brand py-1.5 text-center text-[11px] font-medium text-white">
              Upgrade
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="space-y-3 p-4">
          {/* Metric + chart */}
          <div className="rounded-xl border border-white/8 bg-ink-overlay/60 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-400">Bookings this month</div>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-3xl font-bold tracking-tight text-white">128</span>
                  <span className="mb-1 flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <TrendUp /> +18.2%
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> On track
                </div>
              </div>
              <div className="flex gap-1.5">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-300">
                  6 months
                </span>
                <span className="rounded-md border border-brand/30 bg-brand/15 px-2 py-1 text-[10px] text-brand">
                  Bookings
                </span>
              </div>
            </div>
            <BookingsChart />
            <div className="mt-1 flex justify-between px-1 text-[10px] text-gray-500">
              {["JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total bookings", value: "128", delta: "+18%", up: true },
              { label: "Show rate", value: "94.6%", delta: "+3.1%", up: true },
              { label: "New leads", value: "312", delta: "+27%", up: true },
              { label: "AI chats", value: "1,204", delta: "24h", up: true },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/8 bg-ink-overlay/60 p-3">
                <div className="text-[11px] text-gray-400">{s.label}</div>
                <div className="mt-1 text-lg font-semibold text-white">{s.value}</div>
                <div className="mt-0.5 text-[10px] text-emerald-400">{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Appointments + AI chat */}
          <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
            <div className="rounded-xl border border-white/8 bg-ink-overlay/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Today&apos;s appointments</span>
                <span className="text-[10px] text-gray-500">4 scheduled</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { t: "09:00", n: "Sarah Lin", s: "Teeth Cleaning", c: "confirmed" },
                  { t: "10:30", n: "Marcus Reed", s: "Consultation", c: "booked" },
                  { t: "13:00", n: "Aisha Khan", s: "Whitening", c: "confirmed" },
                  { t: "15:30", n: "Tom Alvarez", s: "Check-up", c: "booked" },
                ].map((a) => (
                  <div key={a.n} className="flex items-center gap-3">
                    <span className="w-10 text-[11px] tabular-nums text-gray-400">{a.t}</span>
                    <span className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-indigo-400/70 to-brand" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-white">{a.n}</div>
                      <div className="truncate text-[10px] text-gray-500">{a.s}</div>
                    </div>
                    <span
                      className={`chip text-[9px] ${
                        a.c === "confirmed"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {a.c}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI receptionist chat */}
            <div className="flex flex-col rounded-xl border border-brand/20 bg-gradient-to-b from-brand/10 to-transparent p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand/30 text-brand">
                  <BotIcon />
                </span>
                <span className="text-xs font-semibold text-white">AI Receptionist</span>
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-sm bg-white/10 px-2.5 py-1.5 text-[10px] text-gray-200">
                  Hi! Can I book a cleaning this week?
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-brand/25 px-2.5 py-1.5 text-[10px] text-gray-100">
                  Of course! I have Tue 9:00 AM or Wed 1:00 PM open. Which works?
                </div>
                <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-sm bg-white/10 px-2.5 py-1.5 text-[10px] text-gray-200">
                  Tuesday 9 is perfect.
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-[10px] text-emerald-400">
                <Check /> Booked — Tue 9:00 AM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Inline SVG chart ──────────────────────────────────────────────────── */
function BookingsChart() {
  // A smooth line with a soft area fill and one highlighted data point.
  return (
    <div className="relative mt-3 h-28">
      <svg viewBox="0 0 600 120" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a5a3f8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <path
          d="M0 86 C 60 80, 90 50, 150 56 S 250 96, 300 70 S 400 18, 450 40 S 540 78, 600 36"
          fill="none"
          stroke="url(#line)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M0 86 C 60 80, 90 50, 150 56 S 250 96, 300 70 S 400 18, 450 40 S 540 78, 600 36 L600 120 L0 120 Z"
          fill="url(#area)"
        />
        <circle cx="450" cy="40" r="4.5" fill="#fff" stroke="#6366f1" strokeWidth="2.5" />
      </svg>
      <div className="absolute left-[72%] top-1 rounded-md bg-white px-1.5 py-0.5 text-[9px] font-semibold text-ink shadow">
        32 booked
      </div>
    </div>
  );
}

/* ── Tiny inline icons (stroke = currentColor) ─────────────────────────── */
const ico = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
function GridIcon() { return <svg {...ico}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>; }
function CalIcon() { return <svg {...ico}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function UsersIcon() { return <svg {...ico}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></svg>; }
function BotIcon() { return <svg {...ico}><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 8V4M9 14h.01M15 14h.01" /></svg>; }
function GlobeIcon() { return <svg {...ico}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" /></svg>; }
function CardIcon() { return <svg {...ico}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>; }
function Chevron() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>; }
function Search() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>; }
function TrendUp() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m3 17 6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>; }
function Check() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>; }
