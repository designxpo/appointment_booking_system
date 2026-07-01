"use client";

import { useState } from "react";
import Link from "next/link";
import { saveAiKey } from "@/action/ai-config";
import { IconBot } from "@/components/icons";
import type { AiProvider } from "@/lib/types";

const PROVIDERS: { value: AiProvider; label: string; disabled?: boolean }[] = [
  { value: "slotnest", label: "Slotnest managed (default)" },
  { value: "anthropic", label: "Anthropic — Claude (your key)" },
  { value: "openai", label: "OpenAI — GPT (coming soon)", disabled: true },
  { value: "google", label: "Google — Gemini (coming soon)", disabled: true },
];

/**
 * "Bring your own AI key" — a Professional+ feature. Lower tiers still SEE the
 * card, but it's locked behind an upgrade prompt.
 */
export function AiKeySettings({
  canUseKey,
  provider: initialProvider,
  model: initialModel,
  hasKey,
}: {
  canUseKey: boolean;
  provider: AiProvider;
  model: string | null;
  hasKey: boolean;
}) {
  const [provider, setProvider] = useState<AiProvider>(initialProvider);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(initialModel ?? "");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setPending(true);
    setStatus(null);
    const res = await saveAiKey({ provider, apiKey, model });
    setPending(false);
    if (res?.error) setStatus({ ok: false, text: res.error });
    else {
      setStatus({ ok: true, text: "AI engine updated ✓" });
      setApiKey("");
    }
  }

  return (
    <section className="card relative overflow-hidden">
      <div className="flex items-center gap-3">
        <span className="page-icon">
          <IconBot className="h-5 w-5" />
        </span>
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-white">
            AI Engine — Bring your own key
            <span className="chip border border-brand/40 bg-brand/10 text-brand">Pro</span>
          </h2>
          <p className="text-xs text-gray-500">
            Run replies on your own AI provider key, on your account and billing.
          </p>
        </div>
      </div>

      {/* Fields (dimmed + non-interactive when locked) */}
      <fieldset
        disabled={!canUseKey}
        className={`mt-5 space-y-4 ${!canUseKey ? "pointer-events-none select-none opacity-40 blur-[1.5px]" : ""}`}
      >
        <div>
          <div className="section-title mb-1">Provider</div>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AiProvider)}
            className="input"
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value} disabled={p.disabled}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {provider !== "slotnest" && (
          <>
            <div>
              <div className="section-title mb-1">API key</div>
              <input
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasKey ? "•••••••••• saved — leave blank to keep" : "sk-ant-…"}
                className="input font-mono"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Stored securely and never shown again. We use it only to generate your
                receptionist&apos;s replies.
              </p>
            </div>
            <div>
              <div className="section-title mb-1">Model (optional)</div>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="claude-sonnet-4-6"
                className="input font-mono"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Leave blank to use the Slotnest default model.
              </p>
            </div>
          </>
        )}

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={pending} className="btn-primary">
            {pending ? "Saving…" : "Save AI engine"}
          </button>
          {status && (
            <span className={`text-sm ${status.ok ? "text-emerald-400" : "text-rose-400"}`}>
              {status.text}
            </span>
          )}
        </div>
      </fieldset>

      {/* Upgrade overlay for lower tiers */}
      {!canUseKey && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/60 p-6 text-center backdrop-blur-[2px]">
          <span className="chip border border-brand/40 bg-brand/10 text-brand">
            Professional feature
          </span>
          <p className="max-w-xs text-sm text-gray-300">
            Bring your own AI key to run the receptionist on your own provider account.
            Upgrade to Professional to unlock it.
          </p>
          <Link href="/dashboard/billing" className="btn-gradient">
            Upgrade to unlock
          </Link>
        </div>
      )}
    </section>
  );
}
