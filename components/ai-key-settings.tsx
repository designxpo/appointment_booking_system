"use client";

import { useState } from "react";
import { saveAiKey } from "@/action/ai-config";
import { IconBot } from "@/components/icons";
import type { AiProvider } from "@/lib/types";

const PROVIDERS: { value: AiProvider; label: string; disabled?: boolean }[] = [
  { value: "anthropic", label: "Anthropic — Claude" },
  { value: "openai", label: "OpenAI — GPT (coming soon)", disabled: true },
  { value: "google", label: "Google — Gemini (coming soon)", disabled: true },
];

/**
 * Connect-your-own-AI-key card. Your AI receptionist runs on YOUR provider key —
 * until one is connected, the assistant is inactive. Available on every plan.
 * The raw key is stored server-side and never sent back to the browser.
 */
export function AiKeySettings({
  provider: initialProvider,
  model: initialModel,
  hasKey,
}: {
  provider: AiProvider;
  model: string | null;
  hasKey: boolean;
}) {
  const [provider, setProvider] = useState<AiProvider>(
    initialProvider === "slotnest" ? "anthropic" : initialProvider,
  );
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(initialModel ?? "");
  const [connected, setConnected] = useState(hasKey);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setPending(true);
    setStatus(null);
    const res = await saveAiKey({ provider, apiKey, model });
    setPending(false);
    if (res?.error) setStatus({ ok: false, text: res.error });
    else {
      setConnected(true);
      setApiKey("");
      setStatus({ ok: true, text: "AI assistant connected ✓" });
    }
  }

  async function disconnect() {
    setPending(true);
    setStatus(null);
    const res = await saveAiKey({ provider: "slotnest" });
    setPending(false);
    if (res?.error) setStatus({ ok: false, text: res.error });
    else {
      setConnected(false);
      setApiKey("");
      setStatus({ ok: true, text: "AI key removed." });
    }
  }

  return (
    <section className="card">
      <div className="flex items-center gap-3">
        <span className="page-icon">
          <IconBot className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-semibold text-white">AI Engine — connect your key</h2>
          <p className="text-xs text-gray-500">
            Your AI receptionist runs on your own AI provider key, on your account and
            billing.
          </p>
        </div>
      </div>

      {/* Connection status */}
      <div
        className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
          connected
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-amber-500/30 bg-amber-500/10 text-amber-200"
        }`}
      >
        {connected
          ? "Connected — your AI assistant is live."
          : "Not connected — your AI assistant stays inactive until you add a key below."}
      </div>

      <div className="mt-4 space-y-4">
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

        <div>
          <div className="section-title mb-1">API key</div>
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={connected ? "•••••••••• saved — leave blank to keep" : "sk-ant-…"}
            className="input font-mono"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Get a Claude key from{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:text-indigo-300"
            >
              console.anthropic.com
            </a>
            . Stored securely and never shown again.
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
          <p className="mt-1 text-[11px] text-gray-500">Leave blank to use the default model.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={save} disabled={pending} className="btn-primary">
            {pending ? "Saving…" : "Save AI key"}
          </button>
          {connected && (
            <button
              onClick={disconnect}
              disabled={pending}
              className="btn-ghost text-rose-300"
            >
              Remove key
            </button>
          )}
          {status && (
            <span className={`text-sm ${status.ok ? "text-emerald-400" : "text-rose-400"}`}>
              {status.text}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
