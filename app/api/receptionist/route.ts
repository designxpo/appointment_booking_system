import { NextResponse, type NextRequest } from "next/server";
import { receptionistTurn, type ChatMessage } from "@/action/receptionist";
import { rateLimit, sweepRateLimits } from "@/lib/rate-limit";

// Each turn is a paid Claude call. Two layers:
//  - per IP+clinic: 20/min (normal user pacing)
//  - per clinic GLOBAL: 120/min — the cost backstop. The left-most
//    X-Forwarded-For value is client-supplied and spoofable, so the per-IP
//    limit alone can be evaded; the clinic-wide cap bounds spend regardless.
const IP_LIMIT = 20;
const CLINIC_LIMIT = 120;
const WINDOW_MS = 60_000;

/**
 * Public endpoint backing the booking widget. Accepts the conversation so far
 * and returns the AI receptionist's next reply. CORS-open so it can be called
 * from a business's own embedded widget.
 */
export async function POST(request: NextRequest) {
  let body: { clinicId?: string; messages?: ChatMessage[]; timezone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.clinicId || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Missing clinicId or messages" }, { status: 400 });
  }
  if (body.messages.length > 40) {
    return NextResponse.json({ error: "Conversation too long" }, { status: 400 });
  }

  // Rate limit. Use the LAST X-Forwarded-For hop (appended by our proxy, not
  // attacker-controlled like the first), plus a clinic-wide cap as backstop.
  sweepRateLimits();
  const xff = request.headers.get("x-forwarded-for");
  const ip =
    xff?.split(",").map((s) => s.trim()).filter(Boolean).pop() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const perIp = rateLimit(`recept:${ip}:${body.clinicId}`, IP_LIMIT, WINDOW_MS);
  const perClinic = rateLimit(`recept-clinic:${body.clinicId}`, CLINIC_LIMIT, WINDOW_MS);
  if (!perIp.ok || !perClinic.ok) {
    const resetAt = Math.max(perIp.resetAt, perClinic.resetAt);
    return NextResponse.json(
      { error: "Too many messages. Please slow down." },
      {
        status: 429,
        headers: {
          ...CORS,
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const result = await receptionistTurn({
    clinicId: body.clinicId,
    messages: body.messages,
    timezone: body.timezone,
  });

  const status = "error" in result ? 400 : 200;
  return NextResponse.json(result, { status, headers: CORS });
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
