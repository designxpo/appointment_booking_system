import { requireProfile } from "@/lib/get-profile";
import { getAnalytics } from "@/lib/dashboard-data";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function AnalyticsPage() {
  const { labels } = await requireProfile();
  const a = await getAnalytics();
  const maxWeek = Math.max(1, ...a.weeklyTrend.map((w) => w.count));
  const maxDay = Math.max(1, ...a.byWeekday);

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="mt-1 text-sm text-gray-500">
        Last 90 days of {labels.appointmentPlural.toLowerCase()}.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Completed" value={a.completed} />
        <Stat label="Upcoming" value={a.upcoming} />
        <Stat
          label="No-show rate"
          value={`${a.noShowRate}%`}
          warn={a.noShowRate >= 15}
          hint={a.noShowRate >= 15 ? "High — reminders + self-reschedule help" : undefined}
        />
        <Stat label="Completion rate" value={`${a.completionRate}%`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold">Bookings per week</h2>
          <div className="mt-4 flex h-36 items-end gap-2">
            {a.weeklyTrend.map((w) => (
              <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-brand/80" style={{ height: `${Math.max(4, (w.count / maxWeek) * 120)}px` }} title={`${w.count}`} />
                <span className="text-[10px] text-gray-400">{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold">Busiest days</h2>
          <div className="mt-4 space-y-2">
            {a.byWeekday.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-gray-500">{WEEKDAYS[i]}</span>
                <div className="h-3 flex-1 overflow-hidden rounded bg-gray-100">
                  <div className="h-full rounded bg-brand/70" style={{ width: `${(c / maxDay) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-gray-500">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold">Top {labels.servicePlural.toLowerCase()}</h2>
          <div className="mt-3 divide-y divide-gray-100">
            {a.topServices.length === 0 && (
              <p className="py-3 text-sm text-gray-500">No data yet.</p>
            )}
            {a.topServices.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 text-sm">
                <span>{s.name}</span>
                <span className="font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold">Outcome mix</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Completed" value={a.completed} total={a.total} color="bg-green-400" />
            <Row label="No-shows" value={a.noShows} total={a.total} color="bg-amber-400" />
            <Row label="Cancelled" value={a.cancelled} total={a.total} color="bg-red-400" />
            <Row label="Upcoming" value={a.upcoming} total={a.total} color="bg-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
  hint,
}: {
  label: string;
  value: number | string;
  warn?: boolean;
  hint?: string;
}) {
  return (
    <div className="card">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${warn ? "text-amber-600" : ""}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-amber-600">{hint}</div>}
    </div>
  );
}

function Row({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-gray-500">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded bg-gray-100">
        <div className={`h-full rounded ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-gray-500">{value}</span>
    </div>
  );
}
