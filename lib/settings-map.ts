import type { Settings } from "@/lib/types";

/** Map a raw settings row (or null) to a fully-defaulted Settings object. */
export function settingsFromRow(
  clinicId: string,
  row: Record<string, unknown> | null,
): Settings {
  return {
    clinic_id: clinicId,
    working_hours: (row?.working_hours as Settings["working_hours"]) ?? [],
    breaks: (row?.breaks as Settings["breaks"]) ?? [],
    blocked_dates: (row?.blocked_dates as string[]) ?? [],
    slot_interval_minutes: (row?.slot_interval_minutes as number) ?? 15,
    timezone: (row?.timezone as string) ?? "UTC",
    min_notice_minutes: (row?.min_notice_minutes as number) ?? 0,
    max_advance_days: (row?.max_advance_days as number) ?? 365,
  };
}
