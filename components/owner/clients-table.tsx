"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getSubscription, statusLabel, type SubStatus } from "@/lib/subscription";
import type { OwnerClient } from "@/lib/owner-data";

const PILL: Record<SubStatus, string> = {
  trialing: "bg-amber-500/15 text-amber-300",
  active: "bg-emerald-500/15 text-emerald-300",
  expired: "bg-rose-500/15 text-rose-300",
  free: "bg-white/10 text-gray-300",
};

function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

export function ClientsTable({
  clients,
  planNames,
}: {
  clients: OwnerClient[];
  planNames: Record<string, string>;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<SubStatus | "all">("all");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return clients
      .map((c) => ({ c, sub: getSubscription(c) }))
      .filter(({ c, sub }) => {
        if (filter !== "all" && sub.status !== filter) return false;
        if (!needle) return true;
        return (
          c.business_name.toLowerCase().includes(needle) ||
          c.email.toLowerCase().includes(needle) ||
          c.subdomain.toLowerCase().includes(needle)
        );
      });
  }, [clients, q, filter]);

  const filters: (SubStatus | "all")[] = ["all", "trialing", "active", "expired", "free"];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search business, email, subdomain…"
          className="input max-w-xs flex-1"
        />
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-brand-muted text-brand"
                  : "text-gray-400 hover:bg-ink-overlay hover:text-gray-200"
              }`}
            >
              {f === "all" ? "All" : statusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ink-raised text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Trial / Renews</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-border">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No matching clients.
                </td>
              </tr>
            )}
            {rows.map(({ c, sub }) => (
              <tr key={c.id} className="hover:bg-ink-overlay/50">
                <td className="px-4 py-3">
                  <Link href={`/owner/clients/${c.id}`} className="block">
                    <div className="font-medium text-white">{c.business_name}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-300">{planNames[c.plan] ?? c.plan}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${PILL[sub.status]}`}>
                    {statusLabel(sub.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {sub.status === "trialing"
                    ? `${sub.trialDaysLeft}d left`
                    : fmtDate(sub.until)}
                </td>
                <td className="px-4 py-3 text-gray-400">{fmtDate(c.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/owner/clients/${c.id}`}
                    className="text-xs font-medium text-brand hover:text-indigo-300"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
