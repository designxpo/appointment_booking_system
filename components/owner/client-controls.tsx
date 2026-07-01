"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ownerSetPlan,
  ownerExtendPlan,
  ownerStartTrial,
  ownerEndTrial,
} from "@/action/owner";
import type { PlanTier } from "@/lib/types";

interface PlanOption {
  tier: PlanTier;
  name: string;
  priceInr: number;
}

type Result = { ok?: boolean; error?: string } | undefined;

export function ClientControls({
  clientId,
  currentPlan,
  planOptions,
}: {
  clientId: string;
  currentPlan: PlanTier;
  planOptions: PlanOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [tier, setTier] = useState<PlanTier>(currentPlan);
  const [months, setMonths] = useState<string>("1");
  const [extendDays, setExtendDays] = useState<string>("30");
  const [trialDays, setTrialDays] = useState<string>("7");

  function run(fn: () => Promise<Result>, okText: string) {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setMsg({ kind: "err", text: res.error });
      else {
        setMsg({ kind: "ok", text: okText });
        router.refresh();
      }
    });
  }

  return (
    <div className="liquid-card p-5">
      <h2 className="text-sm font-semibold text-white">Manage subscription</h2>
      <p className="mt-1 text-xs text-gray-500">
        Changes apply immediately. Assigning a paid plan ends any active trial.
      </p>

      {msg && (
        <p
          className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            msg.kind === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {msg.text}
        </p>
      )}

      {/* Set plan */}
      <div className="mt-5 rounded-xl border border-ink-border p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Set plan
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Tier
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as PlanTier)}
              className="input min-w-[160px]"
            >
              {planOptions.map((p) => (
                <option key={p.tier} value={p.tier}>
                  {p.name}
                  {p.priceInr > 0 ? ` — ₹${p.priceInr.toLocaleString("en-IN")}/mo` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Period
            <select
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              disabled={tier === "free"}
              className="input min-w-[140px] disabled:opacity-50"
            >
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="0">No expiry (comp)</option>
            </select>
          </label>
          <button
            disabled={pending}
            onClick={() =>
              run(
                () =>
                  ownerSetPlan(
                    clientId,
                    tier,
                    tier === "free" ? null : Number(months) === 0 ? null : Number(months),
                  ),
                tier === "free" ? "Downgraded to Free." : "Plan updated.",
              )
            }
            className="btn-gradient disabled:opacity-60"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Extend + Trial */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-ink-border p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Extend paid period
          </div>
          <div className="mt-3 flex items-end gap-2">
            <label className="flex flex-1 flex-col gap-1 text-xs text-gray-400">
              Days
              <input
                type="number"
                min={1}
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                className="input"
              />
            </label>
            <button
              disabled={pending}
              onClick={() =>
                run(
                  () => ownerExtendPlan(clientId, Number(extendDays)),
                  `Extended by ${extendDays} days.`,
                )
              }
              className="btn-outline disabled:opacity-60"
            >
              Extend
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-ink-border p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Free trial
          </div>
          <div className="mt-3 flex items-end gap-2">
            <label className="flex flex-1 flex-col gap-1 text-xs text-gray-400">
              Days
              <input
                type="number"
                min={1}
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                className="input"
              />
            </label>
            <button
              disabled={pending}
              onClick={() =>
                run(
                  () => ownerStartTrial(clientId, Number(trialDays)),
                  `Trial set to ${trialDays} days.`,
                )
              }
              className="btn-outline disabled:opacity-60"
            >
              Start
            </button>
            <button
              disabled={pending}
              onClick={() => run(() => ownerEndTrial(clientId), "Trial ended.")}
              className="btn-ghost text-rose-300 disabled:opacity-60"
            >
              End
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
