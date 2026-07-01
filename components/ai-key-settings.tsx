"use client";

import { useState } from "react";
import { saveAiKey } from "@/action/ai-config";
import { IconBot } from "@/components/icons";
import { AI_PROVIDERS, AI_PROVIDER_KEYS } from "@/lib/ai/providers";
import type { AiProvider } from "@/lib/types";

/**
 * Connect-your-own-AI-key card. Each business runs its receptionist on its OWN
 * provider key — any provider works (Anthropic natively; OpenAI, Gemini, Groq,
 * Mistral, OpenRouter, DeepSeek, xAI, Together, or any OpenAI-compatible
 * endpoint via "Custom"). Until a key is connected the assistant is inactive.
 * The raw key is stored server-side and never sent back to the browser.
 */
export function AiKeySettings({
  provider: initialProvider,
  model: initialModel,
  baseUrl: initialBaseUrl,
  hasKey,
}: {
  provider: AiProvider;
  model: string | null;
  baseUrl: string | null;
  hasKey: boolean;
}) {
  const [provider, setProvider] = useState<AiProvider>(
    initialProvider === "slotnest" || !AI_PROVIDERS[initialProvider]
      ? "anthropic"
      : initialProvider,
  );
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(initialModel ?? "");
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl ?? "");
  const [connected, setConnected] = useState(hasKey);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const def = AI_PROVIDERS[provider];

  async function save() {
    setPending(true);
    setStatus(null);
    const res = await saveAiKey({ provider, apiKey, model, baseUrl });
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
            Run your receptionist on any AI provider you like — Claude, OpenAI, Gemini,
            Groq, Mistral, and more — on your own account &amp; billing.
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
            {AI_PROVIDER_KEYS.map((key) => (
              <option key={key} value={key}>
                {AI_PROVIDERS[key].label}
              </option>
            ))}
          </select>
        </div>

        {def?.needsBaseUrl && (
          <div>
            <div className="section-title mb-1">Base URL</div>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-endpoint.com/v1"
              className="input font-mono"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Any OpenAI-compatible <code>/chat/completions</code> endpoint (self-hosted,
              gateway, etc.).
            </p>
          </div>
        )}

        <div>
          <div className="section-title mb-1">API key</div>
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={connected ? "•••••••••• saved — leave blank to keep" : def?.keyHint ?? "your API key"}
            className="input font-mono"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            {def?.keysUrl ? (
              <>
                Get a key from{" "}
                <a
                  href={def.keysUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand hover:text-indigo-300"
                >
                  {new URL(def.keysUrl).hostname}
                </a>
                .{" "}
              </>
            ) : null}
            Stored securely and never shown again.
          </p>
        </div>

        <div>
          <div className="section-title mb-1">Model (optional)</div>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={def?.defaultModel || "model name"}
            className="input font-mono"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Leave blank to use the provider default
            {def?.defaultModel ? ` (${def.defaultModel})` : ""}.
          </p>
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
