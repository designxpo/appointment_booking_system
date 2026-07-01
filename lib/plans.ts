import type { PlanTier } from "@/lib/types";

/**
 * SaaS billing tiers for the Indian market. Prices are in INR (₹).
 *  - `priceInr`       monthly, whole rupees, GST excluded.
 *  - `priceInrYearly` yearly, whole rupees (defaults to 2 months free = ×10).
 *  - `appointmentCap` monthly booking allowance; null = unlimited.
 *  - `websiteBuilder` gates the no-code CMS behind a paid plan.
 *
 * These are the CODE DEFAULTS: they seed the owner-editable `plan_configs`
 * table, are the source of truth for feature gating, and are the fallback when
 * the DB can't be read. To show the owner's live edits in the UI, read via
 * `getActivePlans()` (lib/plans-data.ts) instead of importing DEFAULT_PLANS.
 */
export interface Plan {
  tier: PlanTier;
  name: string;
  priceInr: number;
  priceInrYearly: number;
  appointmentCap: number | null;
  websiteBuilder: boolean;
  features: string[];
  tagline: string;
}

export const DEFAULT_PLANS: Record<PlanTier, Plan> = {
  // Not a sellable plan — the internal "no active subscription" state a business
  // falls back to when its trial ends or a paid plan lapses. Locked (cap 0) so
  // there's no free-forever usage; the customer must subscribe to continue.
  free: {
    tier: "free",
    name: "Free",
    priceInr: 0,
    priceInrYearly: 0,
    appointmentCap: 0,
    websiteBuilder: false,
    tagline: "No active subscription",
    features: ["Trial ended — subscribe to keep taking bookings"],
  },
  startup: {
    tier: "startup",
    name: "Starter",
    priceInr: 999,
    priceInrYearly: 9990,
    appointmentCap: 500,
    websiteBuilder: true,
    tagline: "For growing local businesses",
    features: [
      "500 appointments / month",
      "Everything in Free",
      "No-code website builder",
      "WhatsApp & email confirmations",
      "Lead capture & mini-CRM",
    ],
  },
  professional: {
    tier: "professional",
    name: "Professional",
    priceInr: 2499,
    priceInrYearly: 24990,
    appointmentCap: 5000,
    websiteBuilder: true,
    tagline: "For busy multi-service teams",
    features: [
      "5,000 appointments / month",
      "Everything in Starter",
      "Custom AI tone & scripts",
      "Bring your own AI key",
      "Analytics & insights",
      "Priority support",
    ],
  },
  enterprise: {
    tier: "enterprise",
    name: "Business",
    priceInr: 6999,
    priceInrYearly: 69990,
    appointmentCap: null,
    websiteBuilder: true,
    tagline: "For chains & high-volume brands",
    features: [
      "Unlimited appointments",
      "Everything in Professional",
      "Bring your own AI key",
      "Multiple staff & locations",
      "Dedicated onboarding",
      "SLA & account manager",
    ],
  },
};

export const PLAN_ORDER: PlanTier[] = [
  "free",
  "startup",
  "professional",
  "enterprise",
];

/** Tiers that aren't sold to customers ("free" is the locked no-subscription state). */
export const HIDDEN_TIERS = new Set<PlanTier>(["free"]);

/** Purchasable tiers, in display order. */
export const SELLABLE_TIERS: PlanTier[] = PLAN_ORDER.filter(
  (t) => !HIDDEN_TIERS.has(t),
);

/** The tier a paid upgrade defaults to / the trial grants. */
export const TRIAL_TIER: PlanTier = "professional";

/** Format whole rupees as ₹1,999 (Indian digit grouping). */
export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ── Feature gating (uses code defaults, keyed by EFFECTIVE tier) ──────────────
// Pass the effective tier from lib/subscription.ts so trial users get full
// access. Gating reads DEFAULT_PLANS (not the DB) so it stays synchronous and
// can't be broken by a bad console edit.

export function canUseWebsiteBuilder(tier: PlanTier): boolean {
  return DEFAULT_PLANS[tier].websiteBuilder;
}

/**
 * "Bring your own AI key" is a Professional+ feature. Trial users get the
 * Professional effective tier, so they can use it during the trial.
 */
export function canUseCustomAiKey(tier: PlanTier): boolean {
  return tier === "professional" || tier === "enterprise";
}

export function isWithinAppointmentCap(
  tier: PlanTier,
  usedThisMonth: number,
): boolean {
  const cap = DEFAULT_PLANS[tier].appointmentCap;
  return cap === null || usedThisMonth < cap;
}
