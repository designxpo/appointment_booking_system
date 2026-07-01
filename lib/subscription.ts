import type { PlanTier, Profile } from "@/lib/types";
import { TRIAL_TIER } from "@/lib/plans";

/**
 * Subscription state derived from a profile. Pure + synchronous.
 *
 * Rules (in priority order):
 *   1. trial_ends_at in the future        → "trialing", full access (TRIAL_TIER)
 *   2. paid plan not past plan_expires_at  → "active", that tier
 *   3. paid plan whose period has lapsed   → "expired", free access
 *   4. otherwise (free plan)               → "free"
 *
 * `tier` is the EFFECTIVE tier used for feature gating — during a trial the
 * business gets Professional features even though profiles.plan is still 'free'.
 */
export type SubStatus = "trialing" | "active" | "expired" | "free";

export interface Subscription {
  status: SubStatus;
  /** Effective tier for feature gating. */
  tier: PlanTier;
  /** The stored plan on the profile (what a paid client is subscribed to). */
  plan: PlanTier;
  /** Whole days left in the trial (0 when not trialing). */
  trialDaysLeft: number;
  /** ISO date the current trial/paid period ends, if any. */
  until: string | null;
  isTrial: boolean;
  isPaid: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Accepts the full profile or the subset of fields the status depends on. */
type SubInput = Pick<Profile, "plan"> &
  Partial<Pick<Profile, "trial_ends_at" | "plan_expires_at">>;

export function getSubscription(profile: SubInput): Subscription {
  const now = Date.now();
  const plan = (profile.plan ?? "free") as PlanTier;

  const trialEnds = profile.trial_ends_at
    ? new Date(profile.trial_ends_at).getTime()
    : 0;
  if (trialEnds > now) {
    return {
      status: "trialing",
      tier: TRIAL_TIER,
      plan,
      trialDaysLeft: Math.max(1, Math.ceil((trialEnds - now) / DAY_MS)),
      until: profile.trial_ends_at ?? null,
      isTrial: true,
      isPaid: false,
    };
  }

  if (plan !== "free") {
    const exp = profile.plan_expires_at
      ? new Date(profile.plan_expires_at).getTime()
      : Infinity; // no expiry = comped / lifetime
    if (exp > now) {
      return {
        status: "active",
        tier: plan,
        plan,
        trialDaysLeft: 0,
        until: profile.plan_expires_at ?? null,
        isTrial: false,
        isPaid: true,
      };
    }
    return {
      status: "expired",
      tier: "free",
      plan,
      trialDaysLeft: 0,
      until: profile.plan_expires_at ?? null,
      isTrial: false,
      isPaid: false,
    };
  }

  return {
    status: "free",
    tier: "free",
    plan: "free",
    trialDaysLeft: 0,
    until: null,
    isTrial: false,
    isPaid: false,
  };
}

/** Convenience: the effective tier for gating. */
export function effectiveTier(profile: SubInput): PlanTier {
  return getSubscription(profile).tier;
}

const STATUS_LABELS: Record<SubStatus, string> = {
  trialing: "Trial",
  active: "Active",
  expired: "Expired",
  free: "Free",
};

export function statusLabel(status: SubStatus): string {
  return STATUS_LABELS[status];
}
