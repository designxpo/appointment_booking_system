import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Email-verification / OAuth callback. Supabase redirects here with a `code`
 * after the user confirms their email; we exchange it for a session and send
 * them to onboarding.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only allow same-origin paths ("/x"), never "//host" or absolute URLs —
  // otherwise ?next= is an open redirect after a successful verification.
  const rawNext = searchParams.get("next") ?? "/onboarding";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
