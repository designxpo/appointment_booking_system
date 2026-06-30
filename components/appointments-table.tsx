"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAppointmentStatus } from "@/action/appointments";
import { IconBot } from "@/components/icons";
import type { AppointmentStatus } from "@/lib/types";
import type { CalendarRow } from "@/lib/dashboard-data";

const STATUSES: AppointmentStatus[] = ["booked", "confirmed", "completed", "cancelled", "no_show"];
const PILL: Record<AppointmentStatus, string> = {
  booked: "bg-blue-500/15 text-blue-300",
  confirmed: "bg-emerald-500/15 text-emerald-300",
  completed: "bg-gray-500/20 text-gray-300",
  cancelled: "bg-rose-500/15 text-rose-300",
  no_show: "bg-amber-500/15 text-amber-300",
};

export function AppointmentsTable({
  rows,
  clientLabel,
  initialQuery = "",
}: {
  rows: CalendarRow[];
  clientLabel: string;
  initialQuery?: string;
}) {
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState(rows);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...items]
      .sort((a, b) => b.starts_at.localeCompare(a.starts_at))
      .filter((r) => filter === "all" || r.status === filter)
      .filter(
        (r) =>
          !q ||
          r.client_name.toLowerCase().includes(q) ||
          r.client_email.toLowerCase().includes(q) ||
          (r.serviceName ?? "").toLowerCase().includes(q),
      );
  }, [items, filter, query]);

  function change(id: string, status: AppointmentStatus) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    startTransition(() => {
      void updateAppointmentStatus(id, status);
    });
  }

  const chips: { key: AppointmentStatus | "all"; label: string }[] = [
    { key: "all", label: "All Status" },
    { key: "booked", label: "Booked" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "no_show", label: "No Show" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === c.key
                  ? "bg-brand text-white"
                  : "border border-ink-soft bg-ink-raised text-gray-400 hover:text-gray-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="input max-w-[200px] py-1.5"
          />
          <button onClick={() => router.refresh()} className="btn-ghost">
            ⟳ Refresh
          </button>
        </div>
      </div>

      <div className="card mt-4 p-0">
        <div className="flex items-center justify-between border-b border-ink-border px-5 py-3 text-sm text-gray-400">
          <span>
            {filter === "all" ? "All Status" : filter.replace("_", " ")}{" "}
            <span className="chip ml-1 bg-ink-overlay">{filtered.length}</span>
          </span>
        </div>
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No appointments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 font-semibold">{clientLabel}</th>
                  <th className="px-3 py-3 font-semibold">Service</th>
                  <th className="px-3 py-3 font-semibold">Date & Time</th>
                  <th className="px-3 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-ink-overlay/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-muted text-xs font-bold text-brand">
                          {a.client_name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-gray-200">{a.client_name}</div>
                          <div className="truncate text-xs text-gray-500">
                            {a.client_phone ?? a.client_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-gray-300">{a.serviceName ?? "—"}</td>
                    <td className="px-3 py-3.5">
                      <div className="text-gray-200">
                        {new Date(a.starts_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(a.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}{" "}
                        – {new Date(a.ends_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="chip bg-brand-muted text-brand">
                        <IconBot className="h-3 w-3" />
                        {a.source === "manual" ? "Manual" : a.source === "reschedule" ? "Reschedule" : "AI Widget"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={a.status}
                        onChange={(e) => change(a.id, e.target.value as AppointmentStatus)}
                        className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium capitalize outline-none ${PILL[a.status]}`}
                        style={{ backgroundColor: "transparent" }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-ink-raised text-gray-200">
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
