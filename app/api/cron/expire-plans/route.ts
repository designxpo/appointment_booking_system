import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cronSecret } from "@/lib/env";

/**
 * Subscription-expiry cron. Run daily:
 *   GET /api/cron/expire-plans  with  Authorization: Bearer <CRON_SECRET>
 *
 * Any paid plan whose plan_expires_at has passed is downgraded to free. The
 * owner extending/renewing the plan from the console pushes plan_expires_at
 * forward again. Comped plans (plan_expires_at = null) are never downgraded.
 */
export async function GET(request: NextRequest) {
  // Fail CLOSED in production when no secret is configured.
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
  const nowIso = new Date().toISOString();

  const { data, error } = await admin
    .from("profiles")
    .update({ plan: "free", plan_expires_at: null })
    .neq("plan", "free")
    .lt("plan_expires_at", nowIso)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, downgraded: data?.length ?? 0 });
}
