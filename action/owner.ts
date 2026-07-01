"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOwner } from "@/lib/owner";
import { DEV_MOCK } from "@/lib/env";
import { PLAN_ORDER } from "@/lib/plans";
import type { PlanTier } from "@/lib/types";
import type { Database } from "@/lib/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/**
 * Owner-console server actions: manual management of every client's
 * subscription plus editing the subscription tiers themselves. All mutations
 * run with the service-role admin client (RLS would otherwise block editing
 * OTHER accounts), so every action re-checks that the caller is an owner.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

async function assertOwner() {
  if (DEV_MOCK) return { admin: createAdminClient() };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isOwner(user.email)) {
    return { error: "Not authorized." as const };
  }
  return { admin: createAdminClient() };
}

function isTier(t: string): t is PlanTier {
  return (PLAN_ORDER as string[]).includes(t);
}

function revalidateClient(clientId: string) {
  revalidatePath("/owner");
  revalidatePath("/owner/clients");
  revalidatePath(`/owner/clients/${clientId}`);
}

/**
 * Set a client's plan.
 *  - tier "free"  → clears the paid period.
 *  - months null  → comped / no expiry.
 *  - months N     → period is N × 30 days from now.
 * Setting any paid tier also ends an in-progress trial.
 */
export async function ownerSetPlan(
  clientId: string,
  tier: PlanTier,
  months: number | null,
) {
  const guard = await assertOwner();
  if ("error" in guard) return guard;
  if (!isTier(tier)) return { error: "Invalid plan." };

  const now = new Date();
  const update: ProfileUpdate =
    tier === "free"
      ? { plan: "free", plan_started_at: null, plan_expires_at: null }
      : {
          plan: tier,
          plan_started_at: now.toISOString(),
          plan_expires_at:
            months && months > 0
              ? new Date(now.getTime() + months * 30 * DAY_MS).toISOString()
              : null,
          trial_ends_at: null,
        };

  const { error } = await guard.admin
    .from("profiles")
    .update(update)
    .eq("id", clientId);
  if (error) return { error: error.message };

  revalidateClient(clientId);
  return { ok: true };
}

/** Push a paid plan's expiry out by N days (from the later of now / current expiry). */
export async function ownerExtendPlan(clientId: string, days: number) {
  const guard = await assertOwner();
  if ("error" in guard) return guard;
  if (!days || days <= 0) return { error: "Enter a positive number of days." };

  const { data: profile } = await guard.admin
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", clientId)
    .single();
  if (!profile) return { error: "Client not found." };
  if (profile.plan === "free") {
    return { error: "Assign a paid plan before extending it." };
  }

  const base = Math.max(
    Date.now(),
    profile.plan_expires_at ? new Date(profile.plan_expires_at).getTime() : 0,
  );
  const { error } = await guard.admin
    .from("profiles")
    .update({ plan_expires_at: new Date(base + days * DAY_MS).toISOString() })
    .eq("id", clientId);
  if (error) return { error: error.message };

  revalidateClient(clientId);
  return { ok: true };
}

/** Start or reset a free trial of N days (default 7). Keeps the stored plan at free. */
export async function ownerStartTrial(clientId: string, days = 7) {
  const guard = await assertOwner();
  if ("error" in guard) return guard;
  if (!days || days <= 0) return { error: "Enter a positive number of days." };

  const { error } = await guard.admin
    .from("profiles")
    .update({
      trial_ends_at: new Date(Date.now() + days * DAY_MS).toISOString(),
    })
    .eq("id", clientId);
  if (error) return { error: error.message };

  revalidateClient(clientId);
  return { ok: true };
}

/** End any active trial immediately (does not touch a paid plan). */
export async function ownerEndTrial(clientId: string) {
  const guard = await assertOwner();
  if ("error" in guard) return guard;

  const { error } = await guard.admin
    .from("profiles")
    .update({ trial_ends_at: null })
    .eq("id", clientId);
  if (error) return { error: error.message };

  revalidateClient(clientId);
  return { ok: true };
}

// ── Tier (plan_configs) editing ──────────────────────────────────────────────

export interface PlanConfigInput {
  name: string;
  price_inr: number;
  price_inr_yearly: number;
  appointment_cap: number | null;
  website_builder: boolean;
  features: string[];
  tagline: string;
  is_active: boolean;
}

/** Update one subscription tier's pricing/caps/features. */
export async function ownerUpdatePlanConfig(
  tier: PlanTier,
  input: PlanConfigInput,
) {
  const guard = await assertOwner();
  if ("error" in guard) return guard;
  if (!isTier(tier)) return { error: "Invalid tier." };

  const name = input.name?.trim();
  if (!name) return { error: "Name is required." };
  if (input.price_inr < 0 || input.price_inr_yearly < 0) {
    return { error: "Prices can't be negative." };
  }

  const { error } = await guard.admin
    .from("plan_configs")
    .update({
      name,
      price_inr: Math.round(input.price_inr),
      price_inr_yearly: Math.round(input.price_inr_yearly),
      appointment_cap:
        input.appointment_cap === null ? null : Math.round(input.appointment_cap),
      website_builder: input.website_builder,
      features: input.features.map((f) => f.trim()).filter(Boolean),
      tagline: input.tagline?.trim() ?? "",
      is_active: input.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("tier", tier);
  if (error) return { error: error.message };

  revalidatePath("/owner/plans");
  revalidatePath("/"); // marketing pricing reads these
  revalidatePath("/dashboard/billing");
  return { ok: true };
}
