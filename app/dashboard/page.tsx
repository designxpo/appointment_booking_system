import Link from "next/link";
import { requireProfile } from "@/lib/get-profile";
import { getAnalytics, getCalendarRows, getLeads } from "@/lib/dashboard-data";
import {
  IconCalendar,
  IconClock,
  IconUsers,
  IconWarning,
  IconCheck,
  IconChart,
  IconArrowRight,
  IconBot,
} from "@/components/icons";
import type { AppointmentStatus } from "@/lib/types";

const STATUS_PILL: Record<AppointmentStatus, string> = {
  booked: "bg-blue-500/15 text-blue-300",
  confirmed: "bg-emerald-500/15 text-emerald-300",
  completed: "bg-gray-500/20 text-gray-300",
  cancelled: "bg-rose-500/15 text-rose-300",
  no_show: "bg-amber-500/15 text-amber-300",
};

function sourceLabel(source: string) {
  return source === "manual" ? "Manual" : source === "reschedule" ? "Reschedule" : "AI Widget";
}

export default async function DashboardHome() {
  const { profile, labels } = await requireProfile();
  const [analytics, rows, leads] = await Promise.all([
    getAnalytics(),
    getCalendarRows(),
    getLeads(),
  ]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const todays = rows
    .filter((r) => new Date(r.starts_at).toDateString() === now.toDateString())
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const upcoming = rows
    .filter(
      (r) =>
        new Date(r.starts_at).getTime() >= now.getTime() &&
        (r.status === "booked" || r.status === "confirmed"),
    )
    .slice(0, 4);

  const t = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="mx-auto max-w-6xl">
      {/* ── Greeting ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            {greeting}, {profile.full_name || profile.business_name} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">{profile.business_name}</p>
        </div>
        <Link href="/dashboard/appointments" className="btn-primary">
          All {labels.appointmentPlural} <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* ── Stat cards ────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          highlight
          icon={<IconCalendar className="h-4 w-4" />}
          label="Today"
          value={todays.filter((x) => x.status !== "cancelled").length}
          hint="Scheduled"
        />
        <StatCard
          icon={<IconClock className="h-4 w-4" />}
          label="Upcoming"
          value={analytics.upcoming}
          hint="Booked & confirmed"
        />
        <StatCard
          icon={<IconUsers className="h-4 w-4" />}
          label={labels.clientPlural}
          value={leads.length}
          hint="All time"
          hintClass="text-emerald-400"
        />
        <StatCard
          icon={<IconWarning className="h-4 w-4" />}
          label="Cancellations"
          value={analytics.cancelled}
          hint={analytics.cancelled === 0 ? "All clear" : "Last 90 days"}
        />
        <StatCard
          icon={<IconCheck className="h-4 w-4" />}
          label="Completion"
          value={`${analytics.completionRate}%`}
          hint="vs. total"
          hintClass="text-emerald-400"
        />
        <StatCard
          icon={<IconChart className="h-4 w-4" />}
          label="No-shows"
          value={`${analytics.noShowRate}%`}
          hint="Missed"
          hintClass={analytics.noShowRate >= 15 ? "text-amber-400" : undefined}
        />
      </div>

      {/* ── Schedule + side panel ─────────────────────────────── */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="card xl:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="page-icon">
                <IconCalendar className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-white">Today&apos;s Schedule</h2>
                <div className="text-xs text-gray-500">
                  {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </div>
              </div>
            </div>
            <span className="chip border border-ink-soft bg-ink-overlay text-gray-400">
              {todays.length} {todays.length === 1 ? labels.appointment.toLowerCase() : labels.appointmentPlural.toLowerCase()}
            </span>
          </div>

          {todays.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">Nothing scheduled today.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-gray-500">
                    <th className="pb-2 pr-4 font-semibold">{labels.client}</th>
                    <th className="pb-2 pr-4 font-semibold">{labels.service}</th>
                    <th className="pb-2 pr-4 font-semibold">Time</th>
                    <th className="pb-2 pr-4 font-semibold">Source</th>
                    <th className="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-border">
                  {todays.map((a) => (
                    <tr key={a.id}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-muted text-xs font-bold text-brand">
                            {a.client_name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-gray-200">{a.client_name}</div>
                            <div className="truncate text-xs text-gray-500">{a.client_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-300">{a.serviceName ?? "—"}</td>
                      <td className="py-3 pr-4 text-gray-300">
                        {t(a.starts_at)} – {t(a.ends_at)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="chip bg-brand-muted text-brand">
                          <IconBot className="h-3 w-3" /> {sourceLabel(a.source)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`chip capitalize ${STATUS_PILL[a.status]}`}>
                          {a.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="card">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-white">
                <IconClock className="h-4 w-4 text-brand" /> Upcoming
              </h2>
              <Link href="/dashboard/appointments" className="flex items-center gap-1 text-xs text-brand">
                See all <IconArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-3 space-y-3">
              {upcoming.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500">Nothing upcoming.</p>
              )}
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-gray-200">{a.client_name}</div>
                      <div className="truncate text-xs text-gray-500">
                        {a.serviceName ?? "—"} ·{" "}
                        {new Date(a.starts_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        , {t(a.starts_at)}
                      </div>
                    </div>
                  </div>
                  <span className={`chip shrink-0 capitalize ${STATUS_PILL[a.status]}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </section>

          {/* AI assistant card */}
          <section className="rounded-2xl bg-gradient-to-br from-brand to-indigo-800 p-5 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> AI Assistant
            </div>
            <h3 className="mt-2 text-lg font-bold">Smart Booking Active</h3>
            <p className="mt-1 text-sm opacity-80">
              Accepting {labels.clientPlural.toLowerCase()} automatically 24/7.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/dashboard/ai" className="btn bg-white/15 text-white hover:bg-white/25">
                Configure
              </Link>
              <Link href="/dashboard/ai" className="btn bg-white/15 text-white hover:bg-white/25">
                <IconBot className="h-4 w-4" /> AI Settings
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  hintClass,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  hintClass?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-transparent bg-brand text-white shadow-glow"
          : "border-ink-border bg-ink-raised"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-semibold uppercase tracking-widest ${
            highlight ? "text-white/80" : "text-gray-500"
          }`}
        >
          {label}
        </span>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            highlight ? "bg-white/15 text-white" : "bg-ink-overlay text-brand"
          }`}
        >
          {icon}
        </span>
      </div>
      <div className={`mt-2 text-3xl font-bold ${highlight ? "text-white" : "text-gray-100"}`}>
        {value}
      </div>
      {hint && (
        <div className={`mt-0.5 text-xs ${hintClass ?? (highlight ? "text-white/70" : "text-gray-500")}`}>
          {hint}
        </div>
      )}
    </div>
  );
}
