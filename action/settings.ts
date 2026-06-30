"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/validation";
import { isValidTimezone } from "@/lib/timezone";

/** Saves availability settings: working hours, breaks, blocked dates, slot size. */
export async function saveSettings(raw: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  // Reject windows where close <= open or break end <= start.
  for (const wh of d.workingHours) {
    if (wh.open_time && wh.close_time && wh.close_time <= wh.open_time) {
      return { error: "Closing time must be after opening time." };
    }
  }
  for (const b of d.breaks) {
    if (b.end_time <= b.start_time) {
      return { error: "Break end must be after its start." };
    }
  }
  if (!isValidTimezone(d.timezone)) {
    return { error: "Unknown timezone." };
  }

  const { error } = await supabase.from("settings").upsert({
    clinic_id: user.id,
    working_hours: d.workingHours,
    breaks: d.breaks,
    blocked_dates: d.blockedDates,
    slot_interval_minutes: d.slotIntervalMinutes,
    timezone: d.timezone,
    min_notice_minutes: d.minNoticeMinutes,
    max_advance_days: d.maxAdvanceDays,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
