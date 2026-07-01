"use client";

import { useState } from "react";
import { saveAiConfig } from "@/action/ai-config";
import { AiKeySettings } from "@/components/ai-key-settings";
import { IconBot, IconCode, IconCopy, IconExternal } from "@/components/icons";
import type { AiConfig } from "@/lib/types";

const TONES: { value: AiConfig["tone"]; label: string }[] = [
  { value: "professional", label: "Professional & Friendly" },
  { value: "warm", label: "Warm & Welcoming" },
  { value: "empathetic", label: "Calm & Empathetic" },
  { value: "concise", label: "Brief & Efficient" },
];

const PRESETS = ["#6366f1", "#10b981", "#0ea5e9", "#2563eb", "#8b5cf6", "#db2777", "#dc2626", "#16a34a"];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        void navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="btn-ghost px-3 py-1.5 text-xs"
    >
      <IconCopy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function AiSettingsHub({
  clinicId,
  initial,
  appUrl,
  canUseKey,
}: {
  clinicId: string;
  initial: AiConfig;
  appUrl: string;
  canUseKey: boolean;
}) {
  const [d, setD] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const widgetUrl = `${appUrl}/embed/${clinicId}`;
  const iframeSnippet = `<!-- Slotnest Widget -->
<iframe
  src="${widgetUrl}"
  style="position:fixed;bottom:0;right:0;width:420px;height:680px;border:none;z-index:9999;background:transparent;"
  allow="clipboard-write"
></iframe>`;
  const scriptSnippet = `<!-- Slotnest Widget -->
<script src="${appUrl}/widget.js" data-slotnest="${clinicId}" async></script>`;

  function set<K extends keyof AiConfig>(key: K, value: AiConfig[K]) {
    setD((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    setPending(true);
    setStatus(null);
    const res = await saveAiConfig({
      instructions: d.instructions,
      faqs: d.faqs.filter((f) => f.question && f.answer),
      tone: d.tone,
      widgetColor: d.widget_color,
      welcomeMessage: d.welcome_message,
      sessionDurationMinutes: d.session_duration_minutes,
    });
    setPending(false);
    setStatus(res?.error ? res.error : "Saved ✓");
  }

  return (
    <div className="space-y-6">
      {/* ── Widget URL ───────────────────────────────────────── */}
      <section className="card flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="page-icon">
            <IconBot className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="section-title">Your widget URL</div>
            <div className="truncate font-mono text-sm text-emerald-300">{widgetUrl}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <CopyButton text={widgetUrl} />
          <a href={widgetUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-3 py-1.5 text-xs">
            <IconExternal className="h-3.5 w-3.5" /> Preview
          </a>
        </div>
      </section>

      {/* ── Embed ─────────────────────────────────────────────── */}
      <section className="card">
        <div className="flex items-center gap-3">
          <span className="page-icon">
            <IconCode className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-white">Embed on Your Website</h2>
            <p className="text-xs text-gray-500">
              Paste one snippet just before the closing{" "}
              <code className="rounded bg-ink-overlay px-1">&lt;/body&gt;</code> tag
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-200">Option 1 — iframe</span>{" "}
              <span className="chip border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                Recommended
              </span>
              <p className="text-xs text-gray-500">Simple drop-in. Works on any website or CMS.</p>
            </div>
            <CopyButton text={iframeSnippet} />
          </div>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-black/50 p-4 text-xs leading-relaxed text-emerald-300">
            <code>{iframeSnippet}</code>
          </pre>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-200">Option 2 — JavaScript snippet</span>
              <p className="text-xs text-gray-500">Great for Google Tag Manager or dynamic sites.</p>
            </div>
            <CopyButton text={scriptSnippet} />
          </div>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-black/50 p-4 text-xs leading-relaxed text-emerald-300">
            <code>{scriptSnippet}</code>
          </pre>
        </div>
      </section>

      {/* ── Appearance ────────────────────────────────────────── */}
      <section className="card">
        <h2 className="font-semibold text-white">Widget Appearance</h2>
        <p className="text-xs text-gray-500">Customise how the booking widget looks on your website</p>

        <div className="mt-4">
          <div className="section-title mb-2">Widget color</div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="h-12 w-12 rounded-2xl border border-white/10"
              style={{ backgroundColor: d.widget_color }}
            />
            <input
              value={d.widget_color}
              onChange={(e) => set("widget_color", e.target.value)}
              className="input max-w-[140px] font-mono"
            />
            <div className="flex gap-2">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => set("widget_color", c)}
                  className={`h-8 w-8 rounded-lg border-2 ${
                    d.widget_color === c ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <div className="section-title mb-2 mt-4">Preview</div>
          <div className="flex justify-end rounded-xl border border-ink-soft bg-ink-overlay p-6">
            <span
              className="btn text-white"
              style={{ backgroundColor: d.widget_color }}
            >
              💬 Book Appointment
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="section-title mb-1">Slot duration</div>
            <select
              value={d.session_duration_minutes}
              onChange={(e) => set("session_duration_minutes", Number(e.target.value))}
              className="input"
            >
              {[15, 30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>{m} minutes</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500">Interval between available booking slots</p>
          </div>
          <div>
            <div className="section-title mb-1">AI communication tone</div>
            <select
              value={d.tone}
              onChange={(e) => set("tone", e.target.value as AiConfig["tone"])}
              className="input"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="section-title mb-1">Welcome message</div>
          <textarea
            rows={2}
            value={d.welcome_message}
            onChange={(e) => set("welcome_message", e.target.value)}
            placeholder="Welcome! I'm your AI booking assistant. How can I help you today?"
            className="input"
          />
          <p className="mt-1 text-[11px] text-gray-500">First message clients see when they open the widget</p>
        </div>

        <div className="mt-4">
          <div className="section-title mb-1">Booking behaviour instructions</div>
          <textarea
            rows={3}
            value={d.instructions}
            onChange={(e) => set("instructions", e.target.value)}
            className="input"
          />
          <p className="mt-1 text-[11px] text-gray-500">Tell the AI how to handle bookings</p>
        </div>
      </section>

      {/* ── AI engine (bring your own key) ─────────────────────── */}
      <AiKeySettings
        canUseKey={canUseKey}
        provider={initial.ai_provider}
        model={initial.ai_model}
        hasKey={initial.has_api_key}
      />

      {/* ── FAQ responses ─────────────────────────────────────── */}
      <section className="card">
        <h2 className="font-semibold text-white">FAQ Responses</h2>
        <p className="text-xs text-gray-500">Answers the AI gives to common questions</p>
        <div className="mt-4 space-y-3">
          {d.faqs.map((f, i) => (
            <div key={i} className="rounded-xl border border-ink-soft p-3">
              <input
                className="input"
                placeholder="Question"
                value={f.question}
                onChange={(e) =>
                  set("faqs", d.faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))
                }
              />
              <textarea
                className="input mt-2"
                rows={2}
                placeholder="Answer"
                value={f.answer}
                onChange={(e) =>
                  set("faqs", d.faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))
                }
              />
              <button
                onClick={() => set("faqs", d.faqs.filter((_, j) => j !== i))}
                className="mt-1 text-xs text-rose-400"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => set("faqs", [...d.faqs, { question: "", answer: "" }])}
            className="btn-ghost"
          >
            + Add FAQ
          </button>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="btn-primary">
          {pending ? "Saving…" : "Save AI Settings"}
        </button>
        {status && <span className="text-sm text-gray-400">{status}</span>}
      </div>
    </div>
  );
}
