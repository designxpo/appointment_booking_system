"use client";

import { useMemo, useState } from "react";
import { INDUSTRIES } from "@/lib/industries";
import { completeOnboarding } from "@/action/onboarding";

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [industryId, setIndustryId] = useState(INDUSTRIES[0].id);
  const [roleId, setRoleId] = useState(INDUSTRIES[0].roles[0].id);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const industry = useMemo(
    () => INDUSTRIES.find((i) => i.id === industryId) ?? INDUSTRIES[0],
    [industryId],
  );

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    formData.set("industry", industryId);
    formData.set("role", roleId);
    const res = await completeOnboarding(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* ── Left panel ────────────────────────────────────────── */}
      <aside className="hidden w-[380px] shrink-0 flex-col justify-between border-r border-ink-border p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
            F
          </div>
          <span className="text-lg font-bold text-white">Slotnest</span>
        </div>
        <div>
          <div className="text-4xl">🚀</div>
          <h2 className="mt-4 text-2xl font-bold text-white">Set up in 2 minutes.</h2>
          <p className="mt-2 text-gray-400">
            Pick your profession and Slotnest adapts its language, AI, and
            defaults to match your industry.
          </p>
        </div>
        <ol className="space-y-3 text-sm">
          <li className={`flex items-center gap-3 ${step === 1 ? "text-brand" : "text-gray-500"}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${step === 1 ? "border-brand" : "border-gray-600"}`}>1</span>
            Choose Profession
          </li>
          <li className={`flex items-center gap-3 ${step === 2 ? "text-brand" : "text-gray-500"}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${step === 2 ? "border-brand" : "border-gray-600"}`}>2</span>
            Business Details
          </li>
        </ol>
      </aside>

      {/* ── Right panel ───────────────────────────────────────── */}
      <section className="flex-1 overflow-y-auto p-8 lg:p-14">
        <div className="section-title">Step {step} of 2</div>

        {step === 1 ? (
          <>
            <h1 className="mt-1 text-3xl font-bold text-white">What&apos;s your profession?</h1>
            <p className="mt-1 text-gray-400">
              Slotnest adapts its language, AI, and defaults to your industry
            </p>

            {/* Category chips */}
            <div className="mt-6 flex max-w-3xl flex-wrap gap-2">
              {INDUSTRIES.map((i) => (
                <button
                  key={i.id}
                  onClick={() => {
                    setIndustryId(i.id);
                    setRoleId(i.roles[0].id);
                  }}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    industryId === i.id
                      ? "bg-brand text-white"
                      : "border border-ink-soft bg-ink-raised text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {i.name}
                </button>
              ))}
            </div>

            {/* Role cards */}
            <div className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {industry.roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRoleId(r.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                    roleId === r.id
                      ? "border-brand bg-brand-muted"
                      : "border-ink-border bg-ink-raised hover:border-ink-soft"
                  }`}
                >
                  <span className="text-2xl">{industry.icon}</span>
                  <span>
                    <span className="block font-semibold text-gray-100">{r.name}</span>
                    <span className="text-xs text-gray-500">{r.labels.clientPlural}</span>
                  </span>
                </button>
              ))}
            </div>

            <button onClick={() => setStep(2)} className="btn-primary mt-8">
              Continue →
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-1 text-3xl font-bold text-white">Business details</h1>
            <p className="mt-1 text-gray-400">
              {industry.icon} {industry.name} ·{" "}
              {industry.roles.find((r) => r.id === roleId)?.name}
            </p>

            <form action={action} className="mt-8 max-w-md space-y-5">
              <div>
                <label className="label" htmlFor="businessName">Business name</label>
                <input id="businessName" name="businessName" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="subdomain">Subdomain</label>
                <div className="flex items-center gap-2">
                  <input id="subdomain" name="subdomain" required placeholder="acme-dental" className="input" />
                  <span className="text-sm text-gray-500">.slotnest.ai</span>
                </div>
              </div>
              {error && <p className="text-sm text-rose-400">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost">
                  ← Back
                </button>
                <button type="submit" disabled={pending} className="btn-primary flex-1">
                  {pending ? "Setting up…" : "Finish setup"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
