import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Service-role Supabase client. BYPASSES Row-Level Security.
 *
 * Use ONLY in trusted server-side code (server actions / route handlers)
 * for operations the public booking flow needs but an anonymous user
 * should not be able to do directly — e.g. inserting an appointment
 * against a clinic the visitor does not own.
 *
 * Never import this into a Client Component.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
