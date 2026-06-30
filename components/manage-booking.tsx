"use client";

import { useState } from "react";
import {
  cancelByToken,
  getRescheduleSlots,
  rescheduleByToken,
  type ManagedAppointment,
} from "@/action/manage";

/** Client self-service: view, cancel, or reschedule via the emailed token link. */
export function ManageBooking({
  token,
  appointment,
}: {
  token: string;
  appointment: ManagedAppointment;
}) {
  const [status, setStatus] = useState(appointment.status);
  const [startsAt, setStartsAt] = useState(appointment.startsAt);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Reschedule picker state
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<{ startsAt: string; remaining: number }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const when = new Date(startsAt).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });
  const isPast = new Date(startsAt).getTime() < Date.now();
  const cancelled = status === "cancelled";

  async function onCancel() {
    if (!confirm("Cancel this appointment?")) return;
    setPending(true);
    setMessage(null);
    const res = await cancelByToken(token);
    setPending(false);
    if (res?.error) setMessage(res.error);
    else {
      setStatus("cancelled");
      setMessage("Your appointment was cancelled. A confirmation email is on its way.");
    }
  }

  async function loadSlots(d: string) {
    setDate(d);
    if (!d) return;
    setLoadingSlots(true);
    setSlots([]);
    const res = await getRescheduleSlots(token, d);
    setLoadingSlots(false);
    if ("error" in res) setMessage(res.error);
    else setSlots(res.slots.map((s) => ({ startsAt: s.startsAt, remaining: s.remaining })));
  }

  async function pick(slotISO: string) {
    setPending(true);
    setMessage(null);
    const res = await rescheduleByToken(token, slotISO);
    setPending(false);
    if ("error" in res) setMessage(res.error ?? "Something went wrong.");
    else if ("startsAt" in res && res.startsAt) {
      setStartsAt(res.startsAt);
      setStatus("booked");
      setShowPicker(false);
      setMessage("Rescheduled! A new confirmation email is on its way.");
    }
  }

  return (
    <div className="card">
      <h1 className="text-xl font-bold">{appointment.businessName}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {appointment.serviceName} for {appointment.clientName}
      </p>

      <div className="mt-4 rounded-lg bg-gray-50 p-4">
        <div className="text-lg font-semibold">{when}</div>
        <div className="mt-1 text-xs capitalize text-gray-500">
          Status: {cancelled ? "cancelled" : status.replace("_", " ")}
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}

      {!cancelled && !isPast && (
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setShowPicker((v) => !v)}
            disabled={pending}
            className="btn-primary"
          >
            Reschedule
          </button>
          <button onClick={onCancel} disabled={pending} className="btn-ghost text-red-600">
            Cancel appointment
          </button>
        </div>
      )}

      {showPicker && !cancelled && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <label className="label">Pick a new date</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => loadSlots(e.target.value)}
            className="input max-w-[220px]"
          />
          {loadingSlots && <p className="mt-3 text-sm text-gray-400">Checking availability…</p>}
          {!loadingSlots && date && slots.length === 0 && (
            <p className="mt-3 text-sm text-gray-500">No openings that day — try another date.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s.startsAt}
                onClick={() => pick(s.startsAt)}
                disabled={pending}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:border-brand hover:text-brand"
              >
                {new Date(s.startsAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
