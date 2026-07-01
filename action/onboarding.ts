"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation";
import { getRole } from "@/lib/industries";
import { DEV_MOCK } from "@/lib/env";

/**
 * Completes onboarding: creates the profile row and seeds default services,
 * settings, AI config, and website data for the chosen industry/role.
 * Requires a verified, authenticated user.
 */
export async function completeOnboarding(formData: FormData) {
  // Mock mode has no backend — the dashboard renders sample data, so just
  // finish the flow and land on it.
  if (DEV_MOCK) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Explicit in-code gate: don't rely solely on the Supabase project setting.
  if (!user.email_confirmed_at) {
    return { error: "Verify your email first — check your inbox for the link." };
  }

  const parsed = onboardingSchema.safeParse({
    businessName: formData.get("businessName"),
    subdomain: formData.get("subdomain"),
    industry: formData.get("industry"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const input = parsed.data;

  const role = getRole(input.industry, input.role);
  if (!role) return { error: "Unknown industry or role" };

  // Profile (RLS: id must equal auth.uid()). Every business starts on a 7-day
  // full-access trial (see lib/subscription.ts) — no card required.
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error: profileErr } = await supabase.from("profiles").insert({
    id: user.id,
    business_name: input.businessName,
    subdomain: input.subdomain,
    industry: input.industry,
    role: input.role,
    plan: "free",
    trial_ends_at: trialEndsAt,
  });
  if (profileErr) {
    if (profileErr.code === "23505") return { error: "That subdomain is taken." };
    return { error: profileErr.message };
  }

  // Seed default services for the role.
  if (role.defaultServices.length) {
    await supabase.from("services").insert(
      role.defaultServices.map((s) => ({
        clinic_id: user.id,
        name: s.name,
        duration_minutes: s.durationMinutes,
      })),
    );
  }

  // Seed Mon–Fri 9–5 working hours, no breaks/blocked dates.
  const workingHours = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
    day_of_week: d,
    open_time: d >= 1 && d <= 5 ? "09:00" : null,
    close_time: d >= 1 && d <= 5 ? "17:00" : null,
  }));

  await Promise.all([
    supabase.from("settings").insert({
      clinic_id: user.id,
      working_hours: workingHours,
      breaks: [],
      blocked_dates: [],
      slot_interval_minutes: 15,
      // Indian market default; owner can change under Settings.
      timezone: "Asia/Kolkata",
    }),
    supabase.from("ai_configs").insert({
      clinic_id: user.id,
      instructions: `You represent ${input.businessName}.`,
      faqs: [],
      tone: "warm",
    }),
    supabase.from("website_data").insert({
      clinic_id: user.id,
      hero_title: input.businessName,
      hero_subtitle: `Book your ${role.labels.appointment.toLowerCase()} online.`,
    }),
  ]);

  redirect("/dashboard");
}
