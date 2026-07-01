"use client";

import { useState } from "react";
import { formatInr, type Plan } from "@/lib/plans";
import type { PlanTier } from "@/lib/types";

/**
 * Client billing view. Subscriptions are activated manually by the Slotnest
 * team (owner console), so a paid upgrade opens a pre-filled WhatsApp/email
 * request rather than a self-serve checkout.
 */
export function BillingPlans({
  plans,
  currentTier,
  storedPlan,
  businessName,
  supportEmail,
  supportWhatsapp,
}: {
  plans: Plan[];
  currentTier: PlanTier; // effective tier (accounts for trial)
  storedPlan: PlanTier; // the plan stored on the profile
  businessName: string;
  supportEmail: string;
  supportWhatsapp: string | null;
}) {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  function requestUpgrade(plan: Plan) {
    const cycleLabel = cycle === "monthly" ? "monthly" : "yearly";
    const message = `Hi Slotnest team, I'd like to upgrade "${businessName}" to the ${plan.name} plan (${cycleLabel} billing). Please help me activate it.`;
    const url = supportWhatsapp
      ? `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(message)}`
      : `mailto:${supportEmail}?subject=${encodeURIComponent(
          `Upgrade to ${plan.name} — ${businessName}`,
        )}&body=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-6">
      {/* Billing cycle toggle */}
      <div className="mb-5 flex items-center gap-3">
        <div className="inline-flex rounded-full border border-ink-border bg-ink-raised p-1 text-sm">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-full px-4 py-1.5 font-medium capitalize transition-colors ${
                cycle === c ? "bg-brand text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {cycle === "yearly" && (
          <span className="text-xs font-medium text-emerald-300">2 months free</span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = p.tier === currentTier;
          const price = cycle === "monthly" ? p.priceInr : p.priceInrYearly;
          const isFree = p.priceInr === 0;
          const popular = p.tier === "professional";
          return (
            <div
              key={p.tier}
              className={`liquid-card relative flex flex-col p-5 ${
                isCurrent ? "ring-2 ring-brand" : popular ? "border-brand/40" : ""
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-medium text-white">
                  Current
                </span>
              )}
              <div className="text-sm font-semibold text-white">{p.name}</div>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-2xl font-bold text-white">
                  {isFree ? "Free" : formatInr(price)}
                </span>
                {!isFree && (
                  <span className="mb-1 text-xs text-gray-500">
                    /{cycle === "monthly" ? "mo" : "yr"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">{p.tagline}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-300">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-brand">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={isCurrent || isFree}
                onClick={() => requestUpgrade(p)}
                className={`mt-5 w-full justify-center ${
                  isCurrent || isFree ? "btn-outline opacity-50" : "btn-gradient"
                }`}
              >
                {isCurrent ? "Current plan" : isFree ? "Free" : "Request upgrade"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        {storedPlan !== currentTier && currentTier === "professional"
          ? "You currently have full access on your free trial. "
          : ""}
        Upgrades are activated by our team, usually within a few hours. Prices exclude 18% GST.
      </p>
    </div>
  );
}
