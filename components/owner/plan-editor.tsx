"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ownerUpdatePlanConfig } from "@/action/owner";
import type { PlanConfig } from "@/lib/plans-data";

export function PlanEditor({ plan }: { plan: PlanConfig }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [name, setName] = useState(plan.name);
  const [tagline, setTagline] = useState(plan.tagline);
  const [monthly, setMonthly] = useState(String(plan.priceInr));
  const [yearly, setYearly] = useState(String(plan.priceInrYearly));
  const [cap, setCap] = useState(plan.appointmentCap === null ? "" : String(plan.appointmentCap));
  const [website, setWebsite] = useState(plan.websiteBuilder);
  const [active, setActive] = useState(plan.isActive);
  const [features, setFeatures] = useState(plan.features.join("\n"));

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await ownerUpdatePlanConfig(plan.tier, {
        name: name.trim(),
        price_inr: Number(monthly) || 0,
        price_inr_yearly: Number(yearly) || 0,
        appointment_cap: cap.trim() === "" ? null : Number(cap),
        website_builder: website,
        features: features.split("\n").map((f) => f.trim()).filter(Boolean),
        tagline: tagline.trim(),
        is_active: active,
      });
      if (res?.error) setMsg({ kind: "err", text: res.error });
      else {
        setMsg({ kind: "ok", text: "Saved." });
        router.refresh();
      }
    });
  }

  return (
    <div className="liquid-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-brand">
            {plan.tier}
          </span>
          <label className="flex items-center gap-1.5 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </label>
        </div>
        {msg && (
          <span
            className={`text-xs ${msg.kind === "ok" ? "text-emerald-300" : "text-rose-300"}`}
          >
            {msg.text}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Display name">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </Field>
        <Field label="Tagline">
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monthly (₹)">
            <input
              type="number"
              min={0}
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Yearly (₹)">
            <input
              type="number"
              min={0}
              value={yearly}
              onChange={(e) => setYearly(e.target.value)}
              className="input"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 items-end gap-3">
          <Field label="Appointment cap (blank = ∞)">
            <input
              type="number"
              min={0}
              value={cap}
              onChange={(e) => setCap(e.target.value)}
              placeholder="Unlimited"
              className="input"
            />
          </Field>
          <label className="flex items-center gap-2 pb-2.5 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={website}
              onChange={(e) => setWebsite(e.target.checked)}
            />
            Website builder
          </label>
        </div>
        <Field label="Features (one per line)">
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            rows={5}
            className="input font-mono text-xs leading-relaxed"
          />
        </Field>
      </div>

      <button onClick={save} disabled={pending} className="btn-gradient mt-4 w-full justify-center disabled:opacity-60">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-400">{label}</span>
      {children}
    </label>
  );
}
