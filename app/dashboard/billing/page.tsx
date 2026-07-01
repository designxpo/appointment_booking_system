import { requireProfile } from "@/lib/get-profile";
import { getActivePlans } from "@/lib/plans-data";
import { getSubscription } from "@/lib/subscription";
import { supportContact } from "@/lib/env";
import { BillingPlans } from "@/components/billing-plans";
import { IconCard } from "@/components/icons";

export default async function BillingPage() {
  const { profile } = await requireProfile();
  const plans = await getActivePlans();
  const sub = getSubscription(profile);

  const renews = profile.plan_expires_at
    ? new Date(profile.plan_expires_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const banner =
    sub.status === "trialing"
      ? {
          tone: "amber" as const,
          text: `You're on a free trial with full Professional access — ${sub.trialDaysLeft} day${sub.trialDaysLeft === 1 ? "" : "s"} left.`,
        }
      : sub.status === "active"
        ? {
            tone: "emerald" as const,
            text: `Your ${plans.find((p) => p.tier === sub.plan)?.name ?? sub.plan} plan is active${renews ? ` — renews on ${renews}` : ""}.`,
          }
        : sub.status === "expired"
          ? {
              tone: "rose" as const,
              text: "Your subscription has ended — bookings are paused. Pick a plan to continue.",
            }
          : {
              tone: "rose" as const,
              text: "Your free trial has ended — bookings are paused. Subscribe to keep taking appointments.",
            };

  const toneClass = {
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    muted: "border-ink-border bg-ink-raised text-gray-300",
  }[banner.tone];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center gap-3">
        <span className="page-icon">
          <IconCard className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
          <p className="text-sm text-gray-500">
            Simple INR pricing. Prices exclude 18% GST.
          </p>
        </div>
      </div>

      <div className={`rounded-xl border px-4 py-3 text-sm ${toneClass}`}>{banner.text}</div>

      <BillingPlans
        plans={plans}
        currentTier={sub.tier}
        storedPlan={sub.plan}
        businessName={profile.business_name}
        supportEmail={supportContact.email}
        supportWhatsapp={supportContact.whatsapp ?? null}
      />
    </div>
  );
}
