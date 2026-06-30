import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLabels } from "@/lib/industries";
import { DEV_MOCK, mockProfile, mockLabels } from "@/lib/dev-mock";
import type { Profile } from "@/lib/types";

/**
 * Loads the signed-in owner's profile for use in dashboard server components.
 * Redirects to /login if unauthenticated, or /onboarding if no profile exists
 * yet. Returns the profile plus its resolved label set.
 */
export async function requireProfile(): Promise<{
  profile: Profile;
  labels: ReturnType<typeof getLabels>;
}> {
  // Dev-only: pretend a business is signed in, no Supabase required.
  if (DEV_MOCK) return { profile: mockProfile, labels: mockLabels };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return {
    profile: profile as Profile,
    labels: getLabels(profile.industry, profile.role),
  };
}
