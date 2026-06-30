import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cronSecret } from "@/lib/env";

/**
 * Payment-intent cleanup cron. Run daily:
 *   GET /api/cron/cleanup-intents  with  Authorization: Bearer <CRON_SECRET>
 *
 * payment_intents are short-lived binding records (plan price + a random cent
 * offset, single-use, 2h TTL). Once an intent is consumed, the append-only
 * `payments` ledger is the permanent record; once it expires it can never be
 * used again. Either way nothing reads the row afterwards, so this job deletes
 * them to keep the table from accumulating one dead row per upgrade attempt.
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

  // 1) Consumed intents — the payments ledger is the lasting audit record.
  const { data: usedRows, error: usedErr } = await admin
    .from("payment_intents")
    .delete()
    .eq("status", "used")
    .select("id");
  if (usedErr) {
    return NextResponse.json({ error: usedErr.message }, { status: 500 });
  }

  // 2) Anything past its expiry (used rows are already gone, so no overlap).
  const { data: expiredRows, error: expiredErr } = await admin
    .from("payment_intents")
    .delete()
    .lt("expires_at", nowIso)
    .select("id");
  if (expiredErr) {
    return NextResponse.json({ error: expiredErr.message }, { status: 500 });
  }

  const deleted = (usedRows?.length ?? 0) + (expiredRows?.length ?? 0);
  return NextResponse.json({ ok: true, deleted });
}
