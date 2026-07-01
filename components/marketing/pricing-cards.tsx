"use client";

import { useState } from "react";
import Link from "next/link";
import { formatInr, type Plan } from "@/lib/plans";

/**
 * Marketing pricing grid with a monthly/annual toggle. Plans are passed in from
 * the server (getActivePlans) so the owner's live edits show here immediately.
 */
export function PricingCards({ plans }: { plans: Plan[] }) {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="mx-auto mt-10 max-w-6xl">
      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center gap-3">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm backdrop-blur">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-full px-5 py-1.5 font-medium capitalize transition-colors ${
                cycle === c ? "bg-brand text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <span
          className={`text-xs font-medium text-emerald-300 transition-opacity ${
            cycle === "yearly" ? "opacity-100" : "opacity-0"
          }`}
        >
          2 months free
        </span>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => {
          const popular = p.tier === "professional";
          const isFree = p.priceInr === 0;
          const price = cycle === "monthly" ? p.priceInr : p.priceInrYearly;
          return (
            <div
              key={p.tier}
              className={`liquid-card relative flex flex-col p-6 ${
                popular ? "border-brand/50 shadow-glow" : "is-quiet"
              }`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[11px] font-medium text-white">
                  Most popular
                </span>
              )}
              <div className="text-sm font-semibold text-white">{p.name}</div>
              <p className="mt-1 text-xs text-gray-500">{p.tagline}</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">
                  {isFree ? "Free" : formatInr(price)}
                </span>
                {!isFree && (
                  <span className="mb-1.5 text-sm text-gray-500">
                    /{cycle === "monthly" ? "mo" : "yr"}
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {p.appointmentCap === null
                  ? "Unlimited appointments"
                  : `Up to ${p.appointmentCap.toLocaleString("en-IN")} appointments/mo`}
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-0.5 text-brand">
                      <Check />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-6 w-full justify-center ${popular ? "btn-gradient" : "btn-outline"}`}
              >
                Start free trial
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        Every plan starts with a 7-day free trial · Cancel anytime · Prices exclude 18% GST
      </p>
    </div>
  );
}

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
