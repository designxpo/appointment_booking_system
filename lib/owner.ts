import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEV_MOCK, optionalEnv } from "@/lib/env";

/**
 * Super-admin ("owner") access control for the /owner console.
 *
 * The owner is identified purely by email — no DB role column. Set OWNER_EMAILS
 * (comma-separated) in the environment. Falls back to the built-in default so
 * the console still works if the env var is missing on a deploy.
 */
const DEFAULT_OWNER_EMAILS = ["priyeshmishraofficial@gmail.com"];

export function ownerEmails(): string[] {
  const raw = optionalEnv("OWNER_EMAILS");
  const list = raw
    ? raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_OWNER_EMAILS;
  return list;
}

export function isOwner(email: string | null | undefined): boolean {
  if (!email) return false;
  return ownerEmails().includes(email.trim().toLowerCase());
}

/**
 * Guard for owner-console server components. Returns the signed-in owner's
 * user, or redirects non-owners away. In DEV_MOCK the console is open (no
 * backend), returning a synthetic owner identity.
 */
export async function requireOwner(): Promise<{ id: string; email: string }> {
  if (DEV_MOCK) {
    return { id: "00000000-0000-0000-0000-0000000000ff", email: ownerEmails()[0] };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isOwner(user.email)) redirect("/dashboard");

  return { id: user.id, email: user.email ?? "" };
}
