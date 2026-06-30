import { dayOfWeekOf, zonedTimeToUtcMs } from "@/lib/timezone";
import type { Appointment, Settings } from "@/lib/types";

/**
 * Pure, timezone-aware slot computation.
 *
 * All comparisons happen on UTC instants (ms). The clinic's working hours,
 * breaks, and blocked dates are wall-clock values in settings.timezone and are
 * converted per-date (DST-safe). Industry rules modeled:
 *
 *  - buffer_minutes  : cleanup/prep time appended to every appointment of the
 *                      service (dentist sterilization, tattoo setup). Blocks
 *                      the calendar; invisible to the client.
 *  - capacity        : N clients may share an IDENTICAL slot of the same
 *                      service (group yoga class). Any other overlap blocks.
 *  - min_notice      : never offer a slot starting sooner than this.
 *  - max_advance_days: never offer a slot further out than this.
 *
 * Kept side-effect free so it is unit-testable and shared by the AI tool,
 * the public booking action, and the reschedule flow.
 */

export interface Slot {
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
  /** Seats still open in this slot (capacity − existing same-slot bookings). */
  remaining: number;
}

export interface ServiceShape {
  id: string;
  duration_minutes: number;
  buffer_minutes?: number;
  capacity?: number;
}

export type ExistingAppointment = Pick<
  Appointment,
  "starts_at" | "ends_at" | "status"
> & { service_id?: string | null };

export interface ComputeSlotsArgs {
  /** Wall-clock date (YYYY-MM-DD) in the CLINIC's timezone. */
  date: string;
  service: ServiceShape;
  settings: Settings;
  /** All non-cancelled appointments that could overlap this date. */
  appointments: ExistingAppointment[];
  /** Current instant, ISO. Injected for testability. */
  now: string;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function computeAvailableSlots({
  date,
  service,
  settings,
  appointments,
  now,
}: ComputeSlotsArgs): Slot[] {
  const tz = settings.timezone || "UTC";
  const buffer = (service.buffer_minutes ?? 0) * 60_000;
  const capacity = Math.max(1, service.capacity ?? 1);
  const durationMs = service.duration_minutes * 60_000;
  const stepMs = (settings.slot_interval_minutes || 15) * 60_000;

  // Fully blocked date (vacation/closure) — wall-clock date in clinic tz.
  if (settings.blocked_dates.includes(date)) return [];

  const wh = settings.working_hours.find(
    (w) => w.day_of_week === dayOfWeekOf(date),
  );
  if (!wh || !wh.open_time || !wh.close_time) return []; // closed that day

  const openMs = zonedTimeToUtcMs(date, toMinutes(wh.open_time), tz);
  const closeMs = zonedTimeToUtcMs(date, toMinutes(wh.close_time), tz);

  const nowMs = new Date(now).getTime();
  const noticeMs = (settings.min_notice_minutes ?? 0) * 60_000;
  const horizonMs =
    nowMs + (settings.max_advance_days ?? 365) * 24 * 60 * 60 * 1000;
  if (openMs > horizonMs) return []; // entire day beyond the booking horizon

  // Busy intervals (UTC ms). Breaks are wall-clock in clinic tz on this date.
  const breaks = settings.breaks.map((b) => ({
    start: zonedTimeToUtcMs(date, toMinutes(b.start_time), tz),
    end: zonedTimeToUtcMs(date, toMinutes(b.end_time), tz),
  }));

  const active = appointments.filter(
    (a) => a.status !== "cancelled" && a.status !== "no_show",
  );

  const slots: Slot[] = [];
  for (let start = openMs; start + durationMs <= closeMs; start += stepMs) {
    const end = start + durationMs;
    const paddedEnd = end + buffer;

    if (start < nowMs + noticeMs) continue; // too soon
    if (start > horizonMs) break; // too far out

    if (breaks.some((b) => start < b.end && b.start < paddedEnd)) continue;

    // Same service + identical slot → shares capacity. Anything else that
    // overlaps (including the buffer tail on both sides) blocks the slot.
    let sameSlot = 0;
    let blocked = false;
    for (const a of active) {
      const aStart = new Date(a.starts_at).getTime();
      const aEnd = new Date(a.ends_at).getTime();
      const sameService = (a.service_id ?? null) === service.id;
      if (sameService && aStart === start && aEnd === end) {
        sameSlot++;
        continue;
      }
      const aPaddedEnd = aEnd + (sameService ? buffer : 0);
      if (start < aPaddedEnd && aStart < paddedEnd) {
        blocked = true;
        break;
      }
    }
    if (blocked || sameSlot >= capacity) continue;

    slots.push({
      startsAt: new Date(start).toISOString(),
      endsAt: new Date(end).toISOString(),
      remaining: capacity - sameSlot,
    });
  }

  return slots;
}

/**
 * UTC window that fully covers a clinic-local date, for querying appointments
 * that might overlap it. Padded a day on each side so cross-midnight and
 * buffer edge cases are always included (the engine re-filters precisely).
 */
export function utcWindowForLocalDate(
  date: string,
  timezone: string,
): { fromISO: string; toISO: string } {
  const dayStart = zonedTimeToUtcMs(date, 0, timezone);
  return {
    fromISO: new Date(dayStart - 24 * 60 * 60 * 1000).toISOString(),
    toISO: new Date(dayStart + 2 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
