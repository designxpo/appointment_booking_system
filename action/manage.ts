"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  computeAvailableSlots,
  utcWindowForLocalDate,
  type Slot,
} from "@/lib/availability";
import { settingsFromRow } from "@/lib/settings-map";
import { zonedDateOf } from "@/lib/timezone";
import { sendCancellationEmail, sendConfirmationEmail } from "@/action/email";

/**
 * Client self-service via the secret manage_token from their emails.
 * No login required — possession of the unguessable token (uuid) IS the auth,
 * the same model as every "manage your booking" link in the industry.
 * Reduces no-shows: clients who can self-reschedule don't just not turn up.
 */

export interface ManagedAppointment {
  id: string;
  clientName: string;
  businessName: string;
  serviceName: string;
  serviceId: string;
  startsAt: string;
  status: string;
  timezone: string;
}

interface TokenAppt {
  id: string;
  clinic_id: string;
  service_id: string | null;
  client_name: string;
  client_email: string;
  starts_at: string;
  ends_at: string;
  status: string;
  services: { name: string } | { name: string }[] | null;
  profiles: { business_name: string } | { business_name: string }[] | null;
}

async function loadByToken(token: string): Promise<TokenAppt | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("appointments")
    .select(
      "id, clinic_id, service_id, client_name, client_email, starts_at, ends_at, status, services(name), profiles(business_name)",
    )
    .eq("manage_token", token)
    .single();
  // Untyped client infers `never` on joined selects; assert the runtime shape.
  return (data as unknown as TokenAppt) ?? null;
}

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export async function getManagedAppointment(
  token: string,
): Promise<ManagedAppointment | null> {
  const appt = await loadByToken(token);
  if (!appt) return null;
  const admin = createAdminClient();
  const { data: setRow } = await admin
    .from("settings")
    .select("timezone")
    .eq("clinic_id", appt.clinic_id)
    .single();
  const svc = one(appt.services as unknown as { name: string }[] | null);
  const prof = one(appt.profiles as unknown as { business_name: string }[] | null);
  return {
    id: appt.id,
    clientName: appt.client_name,
    businessName: prof?.business_name ?? "the business",
    serviceName: svc?.name ?? "your appointment",
    serviceId: appt.service_id ?? "",
    startsAt: appt.starts_at,
    status: appt.status,
    timezone: (setRow?.timezone as string) ?? "UTC",
  };
}

export async function cancelByToken(token: string) {
  const appt = await loadByToken(token);
  if (!appt) return { error: "This link is invalid or expired." };
  if (appt.status === "cancelled") return { error: "Already cancelled." };
  if (new Date(appt.starts_at).getTime() < Date.now()) {
    return { error: "This appointment is in the past." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appt.id);
  if (error) return { error: error.message };

  const svc = one(appt.services as unknown as { name: string }[] | null);
  const prof = one(appt.profiles as unknown as { business_name: string }[] | null);
  await sendCancellationEmail({
    to: appt.client_email,
    clientName: appt.client_name,
    businessName: prof?.business_name ?? "the business",
    serviceName: svc?.name ?? "your appointment",
    startsAt: appt.starts_at,
  }).catch(() => undefined);

  return { ok: true };
}

/** Open slots for the appointment's service on a given clinic-local date. */
export async function getRescheduleSlots(
  token: string,
  date: string,
): Promise<{ slots: Slot[]; timezone: string } | { error: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Invalid date." };
  const appt = await loadByToken(token);
  if (!appt || appt.status === "cancelled") {
    return { error: "This link is invalid or expired." };
  }

  const admin = createAdminClient();
  const [{ data: setRow }, { data: svcRow }] = await Promise.all([
    admin.from("settings").select("*").eq("clinic_id", appt.clinic_id).single(),
    admin
      .from("services")
      .select("id, duration_minutes, buffer_minutes, capacity")
      .eq("id", appt.service_id ?? "")
      .single(),
  ]);
  if (!setRow || !svcRow) return { error: "Scheduling unavailable." };
  const service = svcRow as unknown as {
    id: string;
    duration_minutes: number;
    buffer_minutes: number;
    capacity: number;
  };
  const settings = settingsFromRow(appt.clinic_id, setRow);

  const window = utcWindowForLocalDate(date, settings.timezone);
  const { data: dayAppts } = await admin
    .from("appointments")
    .select("starts_at, ends_at, status, service_id")
    .eq("clinic_id", appt.clinic_id)
    .neq("id", appt.id) // the slot being vacated doesn't block its own move
    .gte("starts_at", window.fromISO)
    .lte("starts_at", window.toISO);

  const slots = computeAvailableSlots({
    date,
    service,
    settings,
    appointments: dayAppts ?? [],
    now: new Date().toISOString(),
  });
  return { slots: slots.slice(0, 24), timezone: settings.timezone };
}

export async function rescheduleByToken(token: string, newStartISO: string) {
  const appt = await loadByToken(token);
  if (!appt || appt.status === "cancelled") {
    return { error: "This link is invalid or expired." };
  }

  const admin = createAdminClient();
  const { data: setRow } = await admin
    .from("settings")
    .select("*")
    .eq("clinic_id", appt.clinic_id)
    .single();
  if (!setRow) return { error: "Scheduling unavailable." };
  const settings = settingsFromRow(appt.clinic_id, setRow);

  const date = zonedDateOf(new Date(newStartISO).getTime(), settings.timezone);
  const result = await getRescheduleSlots(token, date);
  if ("error" in result) return result;

  const match = result.slots.find(
    (s) => new Date(s.startsAt).getTime() === new Date(newStartISO).getTime(),
  );
  if (!match) return { error: "That time is no longer available." };

  const { error } = await admin
    .from("appointments")
    .update({
      starts_at: match.startsAt,
      ends_at: match.endsAt,
      status: "booked",
      reminder_sent: false, // re-arm the reminder for the new time
    })
    .eq("id", appt.id);
  if (error) {
    if (error.code === "23P01") return { error: "That time was just taken." };
    return { error: error.message };
  }

  const svc = one(appt.services as unknown as { name: string }[] | null);
  const prof = one(appt.profiles as unknown as { business_name: string }[] | null);
  await sendConfirmationEmail({
    to: appt.client_email,
    clientName: appt.client_name,
    businessName: prof?.business_name ?? "the business",
    serviceName: svc?.name ?? "your appointment",
    startsAt: match.startsAt,
    manageToken: token,
  }).catch(() => undefined);

  return { ok: true, startsAt: match.startsAt };
}
