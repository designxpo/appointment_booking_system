import type { PlanTier } from "@/lib/types";

/**
 * SaaS billing tiers. Prices are monthly in USDT (crypto subscription paid
 * wallet-to-wallet via MetaMask). `appointmentCap` is the monthly booking
 * allowance; null = unlimited. `websiteBuilder` gates the CMS behind a paid plan.
 */
export interface Plan {
  tier: PlanTier;
  name: string;
  priceUsdt: number;
  appointmentCap: number | null;
  websiteBuilder: boolean;
  features: string[];
}

export const PLANS: Record<PlanTier, Plan> = {
  free: {
    tier: "free",
    name: "Free",
    priceUsdt: 0,
    appointmentCap: 50,
    websiteBuilder: false,
    features: ["Up to 50 appointments/mo", "AI receptionist", "Calendar"],
  },
  startup: {
    tier: "startup",
    name: "Startup",
    priceUsdt: 19,
    appointmentCap: 500,
    websiteBuilder: true,
    features: ["500 appointments/mo", "CMS website builder", "Email confirmations"],
  },
  professional: {
    tier: "professional",
    name: "Professional",
    priceUsdt: 49,
    appointmentCap: 5000,
    websiteBuilder: true,
    features: ["5,000 appointments/mo", "Custom AI tone", "Priority support"],
  },
  enterprise: {
    tier: "enterprise",
    name: "Enterprise",
    priceUsdt: 199,
    appointmentCap: null,
    websiteBuilder: true,
    features: ["Unlimited appointments", "Multiple providers", "SLA & onboarding"],
  },
};

export const PLAN_ORDER: PlanTier[] = [
  "free",
  "startup",
  "professional",
  "enterprise",
];

export function canUseWebsiteBuilder(tier: PlanTier): boolean {
  return PLANS[tier].websiteBuilder;
}

export function isWithinAppointmentCap(
  tier: PlanTier,
  usedThisMonth: number,
): boolean {
  const cap = PLANS[tier].appointmentCap;
  return cap === null || usedThisMonth < cap;
}
