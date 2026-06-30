"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  appointmentStatusSchema,
  createAppointmentSchema,
} from "@/lib/validation";
import {
  computeAvailableSlots,
  utcWindowForLocalDate,
} from "@/lib/availability";
import { zonedDateOf } from "@/lib/timezone";
import { isWithinAppointmentCap } from "@/lib/plans";
import {
  sendConfirmationEmail,
  sendCancellationEmail,
  sendOwnerNotification,
} from "@/action/email";
import { settingsFromRow } from "@/lib/settings-map";

/**
 * Owner action: update an appointment's status from the dashboard/calendar.
 * Cancelling notifies the client by email (previously built but never wired).
 */
export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient();
  const parsed = appointmentStatusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  // Fetch first so we know the previous status + email details (RLS-scoped).
  const { data: appt } = await supabase
    .from("appointments")
    .select("id, status, client_name, client_email, starts_at, clinic_id, services(name)")
    .eq("id", id)
    .single();
  if (!appt) return { error: "Not found" };

  const { error } = await supabase
    .from("appointments")
    .update({ status: parsed.data })
    .eq("id", id);
  if (error) return { error: error.message };

  // Owner cancelled an active booking → tell the client.
  if (parsed.data === "cancelled" && appt.status !== "cancelled") {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("business_name")
      .eq("id", appt.clinic_id)
      .single();
    const svc = appt.services as unknown as { name: string } | null;
    await sendCancellationEmail({
      to: appt.client_email,
      clientName: appt.client_name,
      businessName: profile?.business_name ?? "the business",
      serviceName: (Array.isArray(svc) ? svc[0]?.name : svc?.name) ?? "your appointment",
      startsAt: appt.starts_at,
    }).catch(() => undefined);
  }

  revalidatePath("/dashboard/calendar");
  return { ok: true };
}

/**
 * Public booking action (used by the AI tool, the widget, and reschedule).
 *
 * Runs with the service role because the visitor is anonymous, but performs
 * its own guards: validation → plan cap → real availability (timezone-,
 * buffer-, and capacity-aware) → insert. The capacity-aware DB trigger is the
 * final atomic backstop against races.
 */
export async function bookAppointment(raw: unknown) {
  const parsed = createAppointmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid booking" };
  }
  const input = parsed.data;
  const admin = createAdminClient();

  const { data: service } = await admin
    .from("services")
    .select("id, name, duration_minutes, buffer_minutes, capacity, clinic_id, is_active")
    .eq("id", input.serviceId ?? "")
    .eq("clinic_id", input.clinicId)
    .single();
  if (!service || !service.is_active) {
    return { error: "That service is not available." };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("plan, business_name")
    .eq("id", input.clinicId)
    .single();
  if (!profile) return { error: "Business not found." };

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { count } = await admin
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("clinic_id", input.clinicId)
    .neq("status", "cancelled")
    .gte("created_at", monthStart.toISOString());
  if (!isWithinAppointmentCap(profile.plan, count ?? 0)) {
    return { error: "This business has reached its booking limit for the month." };
  }

  const { data: settingsRow } = await admin
    .from("settings")
    .select("*")
    .eq("clinic_id", input.clinicId)
    .single();
  if (!settingsRow) return { error: "Business is not accepting bookings yet." };
  const settings = settingsFromRow(input.clinicId, settingsRow);

  // The clinic-local date this instant falls on, then a padded UTC query window.
  const startMs = new Date(input.startsAt).getTime();
  const localDate = zonedDateOf(startMs, settings.timezone);
  const window = utcWindowForLocalDate(localDate, settings.timezone);

  const { data: dayAppts } = await admin
    .from("appointments")
    .select("starts_at, ends_at, status, service_id")
    .eq("clinic_id", input.clinicId)
    .gte("starts_at", window.fromISO)
    .lte("starts_at", window.toISO);

  const slots = computeAvailableSlots({
    date: localDate,
    service,
    settings,
    appointments: dayAppts ?? [],
    now: new Date().toISOString(),
  });
  const match = slots.find(
    (s) => new Date(s.startsAt).getTime() === startMs,
  );
  if (!match) return { error: "That time is no longer available." };

  // Upsert the lead (CRM) so repeat bookers don't duplicate, then link it.
  const { data: lead } = await admin
    .from("leads")
    .upsert(
      {
        clinic_id: input.clinicId,
        name: input.clientName,
        email: input.clientEmail,
        phone: input.clientPhone ?? null,
        source: "ai_chat",
        status: "booked",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clinic_id,email" },
    )
    .select("id")
    .single();

  const { data: appt, error } = await admin
    .from("appointments")
    .insert({
      clinic_id: input.clinicId,
      service_id: service.id,
      lead_id: lead?.id ?? null,
      client_name: input.clientName,
      client_email: input.clientEmail,
      client_phone: input.clientPhone ?? null,
      starts_at: match.startsAt,
      ends_at: match.endsAt,
      status: "booked",
      notes: input.notes ?? null,
    })
    .select("id, manage_token")
    .single();

  if (error) {
    // 23P01 = conflict trigger (raced into a full/overlapping slot).
    if (error.code === "23P01") return { error: "That time was just taken." };
    return { error: error.message };
  }

  // Fire-and-forget notifications (never fail the booking on email problems).
  await sendConfirmationEmail({
    to: input.clientEmail,
    clientName: input.clientName,
    businessName: profile.business_name,
    serviceName: service.name,
    startsAt: match.startsAt,
    manageToken: appt.manage_token,
  }).catch(() => undefined);

  admin.auth.admin
    .getUserById(input.clinicId)
    .then(({ data }) => {
      const ownerEmail = data.user?.email;
      if (ownerEmail) {
        return sendOwnerNotification({
          to: ownerEmail,
          businessName: profile.business_name,
          clientName: input.clientName,
          serviceName: service.name,
          startsAt: match.startsAt,
        });
      }
    })
    .catch(() => undefined);

  return { ok: true, appointmentId: appt.id };
}
