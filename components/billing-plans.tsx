"use client";

import { useState } from "react";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import { createPaymentIntent, activatePlan } from "@/action/billing";
import { payWithUsdt } from "@/lib/metamask";
import type { PlanTier } from "@/lib/types";

/**
 * Two-step crypto checkout:
 *   1. Ask the server for a payment intent (unique exact amount, e.g. 19.37).
 *   2. Send exactly that amount via MetaMask, then submit the tx hash.
 * The unique amount is what proves THIS account made the payment.
 */
export function BillingPlans({ currentPlan }: { currentPlan: PlanTier }) {
  const [busy, setBusy] = useState<PlanTier | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function subscribe(tier: PlanTier) {
    const plan = PLANS[tier];
    if (plan.priceUsdt === 0) return;
    setBusy(tier);
    setStatus(null);
    try {
      const intent = await createPaymentIntent(tier);
      if ("error" in intent && intent.error) throw new Error(intent.error);
      if (!("intentId" in intent) || !intent.intentId || intent.amountUsdt == null) {
        throw new Error("Could not start payment.");
      }

      setStatus(`Pay exactly ${intent.amountUsdt} USDT in MetaMask…`);
      const txHash = await payWithUsdt(intent.amountUsdt);

      setStatus("Verifying payment on-chain…");
      const res = await activatePlan(intent.intentId, txHash);
      setStatus(res?.error ? res.error : `Upgraded to ${plan.name} ✓`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {PLAN_ORDER.map((tier) => {
          const p = PLANS[tier];
          const isCurrent = tier === currentPlan;
          return (
            <div
              key={tier}
              className={`card flex flex-col ${isCurrent ? "ring-2 ring-brand" : ""}`}
            >
              <div className="font-semibold">{p.name}</div>
              <div className="mt-1 text-2xl font-bold">
                {p.priceUsdt === 0 ? "Free" : `$${p.priceUsdt}`}
                {p.priceUsdt > 0 && (
                  <span className="text-sm font-normal text-gray-500"> USDT/mo</span>
                )}
              </div>
              <ul className="mt-3 flex-1 space-y-1 text-sm text-gray-600">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <button
                disabled={isCurrent || p.priceUsdt === 0 || busy !== null}
                onClick={() => subscribe(tier)}
                className="btn-primary mt-4 disabled:opacity-50"
              >
                {isCurrent
                  ? "Current plan"
                  : p.priceUsdt === 0
                    ? "Free"
                    : busy === tier
                      ? "Processing…"
                      : "Pay with MetaMask"}
              </button>
            </div>
          );
        })}
      </div>
      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
      <p className="mt-2 text-xs text-gray-400">
        Each upgrade uses a one-time exact amount (e.g. 19.37 USDT) so your
        payment is matched to your account automatically.
      </p>
    </div>
  );
}
