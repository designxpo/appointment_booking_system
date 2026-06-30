import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReminderEmail } from "@/action/email";
import { cronSecret } from "@/lib/env";

/**
 * Reminder cron. Run hourly (Vercel Cron / DigitalOcean scheduler / GH Action):
 *   GET /api/cron/reminders  with header  Authorization: Bearer <CRON_SECRET>
 *
 * Sends a reminder for any booked/confirmed appointment starting in the next
 * ~24h that hasn't been reminded yet, then marks reminder_sent so it never
 * double-sends.
 */
export async function GET(request: NextRequest) {
  // Fail CLOSED: in production a missing CRON_SECRET disables the endpoint
  // entirely (otherwise a forgotten env var leaves it world-callable).
  const secret = cronSecret();
  if (!secret && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data, error } = await admin
    .from("appointments")
    .select("id, client_name, client_email, starts_at, clinic_id, manage_token, services(name), profiles(business_name)")
    .in("status", ["booked", "confirmed"])
    .eq("reminder_sent", false)
    .gte("starts_at", now.toISOString())
    .lte("starts_at", in24h.toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // The loose client can't infer the join shape; assert the runtime shape.
  // Many-to-one joins arrive as a single nested object.
  type ApptRow = {
    id: string;
    client_name: string;
    client_email: string;
    starts_at: string;
    manage_token: string;
    services: { name: string } | null;
    profiles: { business_name: string } | null;
  };
  const appts = (data ?? []) as unknown as ApptRow[];

  let sent = 0;
  for (const a of appts) {
    const res = await sendReminderEmail({
      to: a.client_email,
      clientName: a.client_name,
      businessName: a.profiles?.business_name ?? "Our team",
      serviceName: a.services?.name ?? "your appointment",
      startsAt: a.starts_at,
      manageToken: a.manage_token,
    });
    if (!("error" in res)) {
      await admin.from("appointments").update({ reminder_sent: true }).eq("id", a.id);
      sent++;
    }
  }

  return NextResponse.json({ ok: true, candidates: appts.length, sent });
}
