/**
 * Dependency-free IANA timezone math.
 *
 * The availability engine stores instants in UTC but must interpret a
 * business's working hours ("09:00") in the BUSINESS's timezone. These
 * helpers convert between the two correctly across DST transitions using
 * Intl.DateTimeFormat (built into Node and every browser).
 */

const partsCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = partsCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    partsCache.set(timeZone, f);
  }
  return f;
}

export function isValidTimezone(tz: string): boolean {
  try {
    formatterFor(tz);
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock fields of a UTC instant as seen in `timeZone`. */
export function utcToZonedParts(
  utcMs: number,
  timeZone: string,
): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts = formatterFor(timeZone).formatToParts(new Date(utcMs));
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  // "24" can appear for midnight in some ICU versions; normalize to 0.
  const rawHour = get("hour");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: rawHour === 24 ? 0 : rawHour,
    minute: get("minute"),
  };
}

/** Offset (ms) of `timeZone` from UTC at a given instant. Positive = ahead of UTC. */
export function tzOffsetMs(utcMs: number, timeZone: string): number {
  const p = utcToZonedParts(utcMs, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  // formatToParts drops seconds variance below a minute; fine for schedules.
  return asUtc - Math.floor(utcMs / 60000) * 60000;
}

/**
 * Convert a wall-clock time in `timeZone` to a UTC instant (ms).
 * Two-pass: guess the offset, then re-check it at the guessed instant so DST
 * transitions resolve correctly.
 */
export function zonedTimeToUtcMs(
  dateISO: string, // YYYY-MM-DD (wall-clock date in timeZone)
  minutesFromMidnight: number,
  timeZone: string,
): number {
  const [y, m, d] = dateISO.split("-").map(Number);
  const wallUtc =
    Date.UTC(y, m - 1, d, 0, 0) + minutesFromMidnight * 60_000;

  let guess = wallUtc - tzOffsetMs(wallUtc, timeZone);
  // Second pass with the offset at the guessed instant (handles DST edges).
  guess = wallUtc - tzOffsetMs(guess, timeZone);
  return guess;
}

/** The wall-clock date (YYYY-MM-DD) of a UTC instant in `timeZone`. */
export function zonedDateOf(utcMs: number, timeZone: string): string {
  const p = utcToZonedParts(utcMs, timeZone);
  const mm = String(p.month).padStart(2, "0");
  const dd = String(p.day).padStart(2, "0");
  return `${p.year}-${mm}-${dd}`;
}

/** Day-of-week (0=Sunday) of a YYYY-MM-DD wall-clock date (tz-independent). */
export function dayOfWeekOf(dateISO: string): number {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Curated common timezones for the settings dropdown (full list via Intl). */
export function timezoneOptions(): string[] {
  try {
    // Modern runtimes expose the full IANA list.
    const all = (
      Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
    ).supportedValuesOf?.("timeZone");
    if (all?.length) return all;
  } catch {
    /* fall through */
  }
  return [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];
}
