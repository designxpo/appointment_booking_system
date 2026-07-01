import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_PLANS,
  PLAN_ORDER,
  SELLABLE_TIERS,
  HIDDEN_TIERS,
  type Plan,
} from "@/lib/plans";
import type { PlanTier } from "@/lib/types";

/**
 * Reads the owner-editable subscription tiers from `plan_configs`, falling back
 * to the code defaults (DEFAULT_PLANS) when the DB is unavailable (DEV_MOCK,
 * missing service key, or a fresh project). Use this for anything user-facing —
 * marketing pricing, the client billing page, the owner console — so the
 * owner's live price/feature edits are reflected.
 */
export async function getActivePlans(): Promise<Plan[]> {
  const fallback = SELLABLE_TIERS.map((t) => DEFAULT_PLANS[t]);
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("plan_configs")
      .select("*")
      .eq("is_active", true)
      .order("sort");
    if (error || !data || data.length === 0) return fallback;
    return data.map(rowToPlan);
  } catch {
    return fallback;
  }
}

/** Same, keyed by tier for quick lookups. */
export async function getActivePlanMap(): Promise<Record<PlanTier, Plan>> {
  const plans = await getActivePlans();
  const map = { ...DEFAULT_PLANS };
  for (const p of plans) map[p.tier] = p;
  return map;
}

/** Editable tier config, including inactive tiers, for the owner console. */
export interface PlanConfig extends Plan {
  isActive: boolean;
  sort: number;
}

export async function getAllPlanConfigs(): Promise<PlanConfig[]> {
  const fallback = PLAN_ORDER.map((t, i) => ({
    ...DEFAULT_PLANS[t],
    isActive: !HIDDEN_TIERS.has(t),
    sort: i,
  }));
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("plan_configs").select("*").order("sort");
    if (error || !data || data.length === 0) return fallback;
    return data.map((row) => ({
      ...rowToPlan(row),
      isActive: (row as PlanConfigRow & { is_active: boolean }).is_active,
      sort: (row as PlanConfigRow & { sort: number }).sort,
    }));
  } catch {
    return fallback;
  }
}

type PlanConfigRow = {
  tier: string;
  name: string;
  price_inr: number;
  price_inr_yearly: number;
  appointment_cap: number | null;
  website_builder: boolean;
  features: unknown;
  tagline: string;
};

function rowToPlan(row: PlanConfigRow): Plan {
  return {
    tier: row.tier as PlanTier,
    name: row.name,
    priceInr: row.price_inr,
    priceInrYearly: row.price_inr_yearly,
    appointmentCap: row.appointment_cap,
    websiteBuilder: row.website_builder,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    tagline: row.tagline ?? "",
  };
}
