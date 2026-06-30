"use client";

import { useState } from "react";
import { saveSettings } from "@/action/settings";
import { timezoneOptions } from "@/lib/timezone";
import { IconClock, IconCalendar } from "@/components/icons";
import type { Settings } from "@/lib/types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Tab = "availability" | "blocked";

export function SettingsForm({ initial }: { initial: Settings }) {
  const [tab, setTab] = useState<Tab>("availability");
  const [hours, setHours] = useState(() =>
    Array.from({ length: 7 }, (_, d) => {
      const found = initial.working_hours.find((w) => w.day_of_week === d);
      return {
        day_of_week: d,
        open_time: found?.open_time ?? null,
        close_time: found?.close_time ?? null,
      };
    }),
  );
  const [breaks, setBreaks] = useState(initial.breaks);
  const [blocked, setBlocked] = useState<string[]>(initial.blocked_dates);
  const [interval, setInterval] = useState(initial.slot_interval_minutes);
  const [timezone, setTimezone] = useState(initial.timezone || "UTC");
  const [minNotice, setMinNotice] = useState(initial.min_notice_minutes);
  const [maxAdvance, setMaxAdvance] = useState(initial.max_advance_days);
  const [newBlocked, setNewBlocked] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function toggleDay(d: number, open: boolean) {
    setHours((h) =>
      h.map((x) =>
        x.day_of_week === d
          ? open
            ? { ...x, open_time: "09:00", close_time: "17:00" }
            : { ...x, open_time: null, close_time: null }
          : x,
      ),
    );
  }
  function setTime(d: number, field: "open_time" | "close_time", value: string) {
    setHours((h) => h.map((x) => (x.day_of_week === d ? { ...x, [field]: value } : x)));
  }

  async function save() {
    setPending(true);
    setStatus(null);
    const res = await saveSettings({
      workingHours: hours,
      breaks,
      blockedDates: blocked,
      slotIntervalMinutes: interval,
      timezone,
      minNoticeMinutes: minNotice,
      maxAdvanceDays: maxAdvance,
    });
    setPending(false);
    setStatus(res?.error ? res.error : "Saved ✓");
  }

  return (
    <div className="mt-4 max-w-3xl">
      {/* Tabs */}
      <div className="inline-flex gap-1 rounded-xl border border-ink-soft bg-ink-raised p-1">
        <button
          onClick={() => setTab("availability")}
          className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm ${
            tab === "availability" ? "bg-brand text-white" : "text-gray-400"
          }`}
        >
          <IconClock className="h-4 w-4" /> Availability
        </button>
        <button
          onClick={() => setTab("blocked")}
          className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm ${
            tab === "blocked" ? "bg-brand text-white" : "text-gray-400"
          }`}
        >
          <IconCalendar className="h-4 w-4" /> Blocked Dates
        </button>
      </div>

      {tab === "availability" ? (
        <div className="mt-5 space-y-5">
          <div className="card grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Timezone</label>
              <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {timezoneOptions().map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-500">Hours below are in this timezone.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Slot (min)</label>
                <input type="number" min={5} max={120} step={5} value={interval} onChange={(e) => setInterval(Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Notice (min)</label>
                <input type="number" min={0} max={10080} step={15} value={minNotice} onChange={(e) => setMinNotice(Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Horizon (d)</label>
                <input type="number" min={1} max={365} value={maxAdvance} onChange={(e) => setMaxAdvance(Number(e.target.value))} className="input" />
              </div>
            </div>
          </div>

          {/* Per-day cards */}
          <div className="space-y-3">
            {hours.map((h) => {
              const open = h.open_time !== null;
              return (
                <div key={h.day_of_week} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDay(h.day_of_week, !open)}
                        className={`h-6 w-11 rounded-full p-0.5 transition-colors ${open ? "bg-brand" : "bg-ink-soft"}`}
                        role="switch"
                        aria-checked={open}
                      >
                        <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${open ? "translate-x-5" : ""}`} />
                      </button>
                      <span className="chip bg-brand-muted text-brand">{DAY_SHORT[h.day_of_week]}</span>
                      <span className="font-semibold text-gray-200">{DAY_NAMES[h.day_of_week]}</span>
                    </div>
                    {!open && <span className="text-sm text-gray-500">Closed</span>}
                  </div>
                  {open && (
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Open</label>
                        <input type="time" value={h.open_time ?? ""} onChange={(e) => setTime(h.day_of_week, "open_time", e.target.value)} className="input" />
                      </div>
                      <div>
                        <label className="label">Close</label>
                        <input type="time" value={h.close_time ?? ""} onChange={(e) => setTime(h.day_of_week, "close_time", e.target.value)} className="input" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Daily breaks */}
          <div className="card">
            <h2 className="font-semibold text-white">Daily breaks</h2>
            <p className="mb-3 text-xs text-gray-500">Applied to every working day (e.g. lunch).</p>
            {breaks.map((b, i) => (
              <div key={i} className="mb-2 flex items-center gap-3">
                <input type="time" value={b.start_time} onChange={(e) => setBreaks(breaks.map((x, j) => (j === i ? { ...x, start_time: e.target.value } : x)))} className="input max-w-[140px]" />
                <span className="text-gray-500">to</span>
                <input type="time" value={b.end_time} onChange={(e) => setBreaks(breaks.map((x, j) => (j === i ? { ...x, end_time: e.target.value } : x)))} className="input max-w-[140px]" />
                <button onClick={() => setBreaks(breaks.filter((_, j) => j !== i))} className="text-sm text-rose-400">
                  Remove
                </button>
              </div>
            ))}
            <button onClick={() => setBreaks([...breaks, { start_time: "12:00", end_time: "13:00" }])} className="btn-ghost">
              + Add break
            </button>
          </div>
        </div>
      ) : (
        <div className="card mt-5">
          <h2 className="font-semibold text-white">Blocked Dates & Holidays</h2>
          <p className="mb-4 text-xs text-gray-500">Block dates when you will be closed.</p>
          <div className="flex flex-wrap gap-2">
            <input type="date" value={newBlocked} onChange={(e) => setNewBlocked(e.target.value)} className="input max-w-[200px]" />
            <button
              onClick={() => {
                if (newBlocked && !blocked.includes(newBlocked)) {
                  setBlocked([...blocked, newBlocked].sort());
                  setNewBlocked("");
                }
              }}
              className="btn-primary"
            >
              + Block Date
            </button>
          </div>
          {blocked.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              <div className="text-3xl">📅</div>
              No dates blocked — add holidays and days off above.
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {blocked.map((d) => (
                <div key={d} className="flex items-center justify-between rounded-xl border border-ink-soft px-4 py-2.5 text-sm">
                  <span className="text-gray-200">
                    {new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <button onClick={() => setBlocked(blocked.filter((x) => x !== d))} className="text-rose-400">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button onClick={save} disabled={pending} className="btn-primary">
          {pending ? "Saving…" : "Save settings"}
        </button>
        {status && <span className="text-sm text-gray-400">{status}</span>}
      </div>
    </div>
  );
}
