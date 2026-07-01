import Link from "next/link";
import { listClients } from "@/lib/owner-data";
import { getActivePlanMap } from "@/lib/plans-data";
import { getSubscription, type SubStatus } from "@/lib/subscription";
import { formatInr, PLAN_ORDER } from "@/lib/plans";
import { StatusPill } from "@/components/owner/status-pill";

export const dynamic = "force-dynamic";

export default async function OwnerOverviewPage() {
  const [clients, planMap] = await Promise.all([listClients(), getActivePlanMap()]);

  const counts: Record<SubStatus, number> = { trialing: 0, active: 0, expired: 0, free: 0 };
  let mrr = 0;
  const byPlan: Record<string, number> = {};
  for (const c of clients) {
    const sub = getSubscription(c);
    counts[sub.status] += 1;
    if (sub.status === "active") mrr += planMap[c.plan]?.priceInr ?? 0;
    byPlan[c.plan] = (byPlan[c.plan] ?? 0) + 1;
  }

  const recent = clients.slice(0, 8);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Everything across your Slotnest customers at a glance.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total clients" value={clients.length.toString()} />
        <Stat label="On trial" value={counts.trialing.toString()} accent="amber" />
        <Stat label="Paying" value={counts.active.toString()} accent="emerald" />
        <Stat
          label="Est. MRR"
          value={formatInr(mrr)}
          hint="Active paid plans, monthly"
          accent="brand"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Plan distribution */}
        <div className="liquid-card p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-white">Plan distribution</h2>
          <ul className="mt-4 space-y-3">
            {PLAN_ORDER.map((tier) => {
              const n = byPlan[tier] ?? 0;
              const pct = clients.length ? Math.round((n / clients.length) * 100) : 0;
              return (
                <li key={tier}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{planMap[tier]?.name ?? tier}</span>
                    <span className="text-gray-500">{n}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-overlay">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Recent signups */}
        <div className="liquid-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent signups</h2>
            <Link href="/owner/clients" className="text-xs text-brand hover:text-indigo-300">
              View all →
            </Link>
          </div>
          <div className="mt-3 divide-y divide-ink-border">
            {recent.length === 0 && (
              <p className="py-6 text-sm text-gray-500">No clients yet.</p>
            )}
            {recent.map((c) => {
              const sub = getSubscription(c);
              return (
                <Link
                  key={c.id}
                  href={`/owner/clients/${c.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:opacity-80"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{c.business_name}</div>
                    <div className="truncate text-xs text-gray-500">{c.email}</div>
                  </div>
                  <StatusPill status={sub.status} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "brand" | "emerald" | "amber";
}) {
  const ring =
    accent === "emerald"
      ? "text-emerald-300"
      : accent === "amber"
        ? "text-amber-300"
        : accent === "brand"
          ? "text-brand"
          : "text-white";
  return (
    <div className="liquid-card p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${ring}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}
