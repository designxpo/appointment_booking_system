import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getClient,
  clientUsageThisMonth,
  clientPayments,
} from "@/lib/owner-data";
import { getActivePlanMap } from "@/lib/plans-data";
import { getSubscription } from "@/lib/subscription";
import { formatInr } from "@/lib/plans";
import { getRole } from "@/lib/industries";
import { ClientControls } from "@/components/owner/client-controls";
import { StatusPill } from "@/components/owner/status-pill";

export const dynamic = "force-dynamic";

function fmt(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
}

export default async function OwnerClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const [planMap, usage, payments] = await Promise.all([
    getActivePlanMap(),
    clientUsageThisMonth(id),
    clientPayments(id),
  ]);

  const sub = getSubscription(client);
  const plan = planMap[client.plan];
  const roleName = getRole(client.industry, client.role)?.name ?? client.role;
  const cap = plan?.appointmentCap ?? null;

  return (
    <div>
      <Link href="/owner/clients" className="text-xs text-gray-400 hover:text-gray-200">
        ← All clients
      </Link>

      <header className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{client.business_name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {client.email} · {roleName} ·{" "}
            <a
              href={`/site/${client.subdomain}`}
              className="text-brand hover:text-indigo-300"
              target="_blank"
              rel="noreferrer"
            >
              /{client.subdomain}
            </a>
          </p>
        </div>
        <StatusPill status={sub.status} />
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subscription summary */}
        <div className="space-y-4 lg:col-span-1">
          <div className="liquid-card p-5">
            <h2 className="text-sm font-semibold text-white">Subscription</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Plan" value={plan?.name ?? client.plan} />
              <Row
                label="Price"
                value={plan && plan.priceInr > 0 ? `${formatInr(plan.priceInr)}/mo` : "Free"}
              />
              <Row
                label="Status"
                value={sub.status === "trialing" ? `Trial · ${sub.trialDaysLeft}d left` : sub.status}
              />
              <Row label="Started" value={fmt(client.plan_started_at)} />
              <Row label="Renews / expires" value={fmt(client.plan_expires_at)} />
              <Row label="Trial ends" value={fmt(client.trial_ends_at)} />
              <Row label="Joined" value={fmt(client.created_at)} />
            </dl>
          </div>

          <div className="liquid-card p-5">
            <h2 className="text-sm font-semibold text-white">Usage this month</h2>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{usage.toLocaleString("en-IN")}</span>
              <span className="mb-1 text-sm text-gray-500">
                / {cap === null ? "∞" : cap.toLocaleString("en-IN")} appointments
              </span>
            </div>
            {cap !== null && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-overlay">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.min(100, Math.round((usage / cap) * 100))}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Manual controls */}
        <div className="lg:col-span-2">
          <ClientControls
            clientId={client.id}
            currentPlan={client.plan}
            planOptions={Object.values(planMap).map((p) => ({
              tier: p.tier,
              name: p.name,
              priceInr: p.priceInr,
            }))}
          />

          {payments.length > 0 && (
            <div className="liquid-card mt-6 p-5">
              <h2 className="text-sm font-semibold text-white">Payment history</h2>
              <div className="mt-3 divide-y divide-ink-border text-sm">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5">
                    <span className="text-gray-300">{fmt(p.paid_at)}</span>
                    <span className="text-gray-400">{p.plan}</span>
                    <span className="font-medium text-white">{p.amount_usdt} USDT</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-200">{value}</dd>
    </div>
  );
}
