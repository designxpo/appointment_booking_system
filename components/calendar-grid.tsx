"use client";

import { useMemo, useState, useTransition } from "react";
import { updateAppointmentStatus } from "@/action/appointments";
import type { AppointmentStatus } from "@/lib/types";
import type { CalendarRow } from "@/lib/dashboard-data";

type View = "month" | "week" | "day";

const STATUS_COLORS: Record<AppointmentStatus, { dot: string; block: string; pill: string }> = {
  booked: {
    dot: "bg-blue-400",
    block: "border-blue-400/50 bg-blue-500/15 text-blue-200",
    pill: "bg-blue-500/15 text-blue-300",
  },
  confirmed: {
    dot: "bg-emerald-400",
    block: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200",
    pill: "bg-emerald-500/15 text-emerald-300",
  },
  completed: {
    dot: "bg-gray-400",
    block: "border-gray-400/40 bg-gray-500/15 text-gray-300",
    pill: "bg-gray-500/20 text-gray-300",
  },
  cancelled: {
    dot: "bg-rose-400",
    block: "border-rose-400/40 bg-rose-500/10 text-rose-300 line-through",
    pill: "bg-rose-500/15 text-rose-300",
  },
  no_show: {
    dot: "bg-amber-400",
    block: "border-amber-400/50 bg-amber-500/15 text-amber-200",
    pill: "bg-amber-500/15 text-amber-300",
  },
};

const GRID_START_HOUR = 7;
const GRID_END_HOUR = 21;
const HOUR_PX = 56;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
/** LOCAL date key — toISOString would shift evenings to the wrong column. */
function ymd(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function CalendarGrid({
  rows,
  clientLabel,
}: {
  rows: CalendarRow[];
  clientLabel: string;
}) {
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [items, setItems] = useState(rows);
  const [selected, setSelected] = useState<CalendarRow | null>(null);
  const [, startTransition] = useTransition();

  const byDate = useMemo(() => {
    const m = new Map<string, CalendarRow[]>();
    for (const r of items) {
      const key = ymd(new Date(r.starts_at));
      (m.get(key) ?? m.set(key, []).get(key)!).push(r);
    }
    for (const arr of m.values()) arr.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    return m;
  }, [items]);

  function changeStatus(id: string, status: AppointmentStatus) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    startTransition(() => {
      void updateAppointmentStatus(id, status);
    });
  }

  function shift(dir: number) {
    setCursor((c) => {
      if (view === "day") return addDays(c, dir);
      if (view === "week") return addDays(c, dir * 7);
      const x = new Date(c);
      x.setMonth(x.getMonth() + dir);
      return startOfDay(x);
    });
  }

  const heading = useMemo(() => {
    if (view === "month")
      return cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    if (view === "day")
      return cursor.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const ws = addDays(cursor, -cursor.getDay());
    const we = addDays(ws, 6);
    return `${ws.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${we.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${we.getFullYear()}`;
  }, [view, cursor]);

  return (
    <div className="mt-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        {(Object.keys(STATUS_COLORS) as AppointmentStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5 capitalize">
            <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[s].dot}`} />
            {s.replace("_", " ")}
          </span>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="btn-ghost px-3 py-1.5" onClick={() => shift(-1)}>‹</button>
          <button className="btn-ghost px-3 py-1.5" onClick={() => shift(1)}>›</button>
          <button className="btn-ghost px-3 py-1.5" onClick={() => setCursor(startOfDay(new Date()))}>
            today
          </button>
        </div>
        <span className="font-semibold text-white">{heading}</span>
        <div className="flex gap-1 rounded-xl border border-ink-soft bg-ink-raised p-1">
          {(["month", "week", "day"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1 text-sm capitalize ${
                view === v ? "bg-brand text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {view === "month" && (
          <MonthGrid cursor={cursor} byDate={byDate} onSelect={setSelected} />
        )}
        {view !== "month" && (
          <TimeGrid
            days={
              view === "day"
                ? [cursor]
                : Array.from({ length: 7 }, (_, i) => addDays(addDays(cursor, -cursor.getDay()), i))
            }
            byDate={byDate}
            onSelect={setSelected}
          />
        )}
      </div>

      {selected && (
        <DetailsModal
          appt={selected}
          clientLabel={clientLabel}
          onClose={() => setSelected(null)}
          onStatus={changeStatus}
        />
      )}
    </div>
  );
}

/* ── Week/Day time grid ─────────────────────────────────────────── */

function TimeGrid({
  days,
  byDate,
  onSelect,
}: {
  days: Date[];
  byDate: Map<string, CalendarRow[]>;
  onSelect: (r: CalendarRow) => void;
}) {
  const hours = Array.from(
    { length: GRID_END_HOUR - GRID_START_HOUR },
    (_, i) => GRID_START_HOUR + i,
  );
  const totalH = hours.length * HOUR_PX;

  function blockStyle(r: CalendarRow) {
    const s = new Date(r.starts_at);
    const e = new Date(r.ends_at);
    const startMin = s.getHours() * 60 + s.getMinutes() - GRID_START_HOUR * 60;
    const durMin = Math.max(20, (e.getTime() - s.getTime()) / 60000);
    return {
      top: `${(startMin / 60) * HOUR_PX}px`,
      height: `${(durMin / 60) * HOUR_PX - 2}px`,
    };
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-border bg-ink-raised">
      <div className="flex min-w-[760px]">
        {/* Hour gutter */}
        <div className="w-14 shrink-0 border-r border-ink-border pt-10">
          {hours.map((h) => (
            <div key={h} className="relative" style={{ height: HOUR_PX }}>
              <span className="absolute -top-2 right-2 text-[11px] text-gray-500">
                {h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`}
              </span>
            </div>
          ))}
        </div>
        {/* Day columns */}
        {days.map((d) => {
          const dayRows = (byDate.get(ymd(d)) ?? []).filter((r) => {
            const h = new Date(r.starts_at).getHours();
            return h >= GRID_START_HOUR && h < GRID_END_HOUR;
          });
          const isToday = sameDay(d, new Date());
          return (
            <div key={d.toISOString()} className="min-w-[100px] flex-1 border-r border-ink-border last:border-r-0">
              <div
                className={`flex h-10 items-center justify-center border-b border-ink-border text-xs font-semibold uppercase tracking-wider ${
                  isToday ? "text-brand" : "text-gray-500"
                }`}
              >
                {d.toLocaleDateString(undefined, { weekday: "short" })} {d.getMonth() + 1}/{d.getDate()}
              </div>
              <div className="relative" style={{ height: totalH }}>
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-b border-ink-border/60"
                    style={{ top: (h - GRID_START_HOUR + 1) * HOUR_PX - 1 }}
                  />
                ))}
                {isToday && <NowLine />}
                {dayRows.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelect(r)}
                    style={blockStyle(r)}
                    className={`absolute inset-x-1 overflow-hidden rounded-lg border px-1.5 py-0.5 text-left text-[11px] leading-tight transition-transform hover:scale-[1.02] ${STATUS_COLORS[r.status].block}`}
                    title={`${r.client_name} — ${r.serviceName ?? ""}`}
                  >
                    <div className="font-semibold">{fmtTime(r.starts_at)}</div>
                    <div className="truncate">
                      {r.client_name}
                      {r.serviceName ? ` — ${r.serviceName}` : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NowLine() {
  const now = new Date();
  const min = now.getHours() * 60 + now.getMinutes() - GRID_START_HOUR * 60;
  if (min < 0 || min > (GRID_END_HOUR - GRID_START_HOUR) * 60) return null;
  return (
    <div
      className="absolute inset-x-0 z-10 border-t-2 border-brand"
      style={{ top: `${(min / 60) * HOUR_PX}px` }}
    >
      <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-brand" />
    </div>
  );
}

/* ── Month grid ─────────────────────────────────────────────────── */

function MonthGrid({
  cursor,
  byDate,
  onSelect,
}: {
  cursor: Date;
  byDate: Map<string, CalendarRow[]>;
  onSelect: (r: CalendarRow) => void;
}) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = addDays(first, -first.getDay());
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  return (
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-ink-border bg-ink-border text-sm">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div key={d} className="bg-ink-raised p-2 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {d}
        </div>
      ))}
      {cells.map((d) => {
        const inMonth = d.getMonth() === cursor.getMonth();
        const dayRows = byDate.get(ymd(d)) ?? [];
        return (
          <div key={d.toISOString()} className={`min-h-[96px] p-1.5 ${inMonth ? "bg-ink-raised" : "bg-ink"}`}>
            <div className={`text-xs ${sameDay(d, new Date()) ? "font-bold text-brand" : "text-gray-500"}`}>
              {d.getDate()}
            </div>
            <div className="mt-1 space-y-0.5">
              {dayRows.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className={`block w-full truncate rounded border px-1 text-left text-[10px] ${STATUS_COLORS[r.status].block}`}
                >
                  {fmtTime(r.starts_at)} {r.client_name}
                </button>
              ))}
              {dayRows.length > 3 && (
                <div className="text-[10px] text-gray-500">+{dayRows.length - 3} more</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Details modal ──────────────────────────────────────────────── */

function DetailsModal({
  appt,
  clientLabel,
  onClose,
  onStatus,
}: {
  appt: CalendarRow;
  clientLabel: string;
  onClose: () => void;
  onStatus: (id: string, s: AppointmentStatus) => void;
}) {
  const act = (s: AppointmentStatus) => () => onStatus(appt.id, s);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-ink-border bg-ink-raised"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between bg-brand px-5 py-4 text-white">
          <div>
            <h3 className="text-lg font-bold">Appointment Details</h3>
            <div className="text-sm opacity-80">
              {new Date(appt.starts_at).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 p-5 text-sm">
          <div>
            <div className="section-title">{clientLabel}</div>
            <div className="mt-1 font-medium text-gray-200">{appt.client_name}</div>
            <div className="text-xs text-gray-500">{appt.client_phone ?? appt.client_email}</div>
          </div>
          <div>
            <div className="section-title">Service</div>
            <div className="mt-1 font-medium text-gray-200">{appt.serviceName ?? "—"}</div>
          </div>
          <div>
            <div className="section-title">Time</div>
            <div className="mt-1 font-medium text-gray-200">
              {fmtTime(appt.starts_at)} — {fmtTime(appt.ends_at)}
            </div>
          </div>
          <div>
            <div className="section-title">Status</div>
            <span className={`chip mt-1 capitalize ${STATUS_COLORS[appt.status].pill}`}>
              {appt.status.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-ink-border p-4">
          <button onClick={act("confirmed")} className="btn-primary">Confirm</button>
          <button onClick={act("completed")} className="btn-ghost">Mark Completed</button>
          <button onClick={act("no_show")} className="btn-ghost">No Show</button>
          <button onClick={act("cancelled")} className="btn-danger">Cancel</button>
        </div>
      </div>
    </div>
  );
}
