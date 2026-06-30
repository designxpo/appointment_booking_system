"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/action/receptionist";

interface WidgetService {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
}

/**
 * The embeddable AI booking chat. Opens on a "Select a Service" step (when
 * services are provided), then drops into the AI conversation. Talks to
 * /api/receptionist. Accent color is customizable per business.
 */
export function BookingWidget({
  clinicId,
  businessName,
  accentColor = "#6366f1",
  services = [],
  welcomeMessage,
}: {
  clinicId: string;
  businessName: string;
  accentColor?: string;
  services?: WidgetService[];
  welcomeMessage?: string;
}) {
  const greeting =
    welcomeMessage ||
    `Hi! I'm the assistant for ${businessName}. How can I help you book today?`;

  const [stage, setStage] = useState<"select" | "chat">(
    services.length > 0 ? "select" : "chat",
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendText(text: string) {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: text.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/receptionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          messages: next,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? data.error ?? "Something went wrong." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function pickService(s: WidgetService) {
    setStage("chat");
    void sendText(`I'd like to book: ${s.name}`);
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 text-white"
        style={{ backgroundColor: accentColor }}
      >
        {stage === "chat" && services.length > 0 && (
          <button
            onClick={() => setStage("select")}
            aria-label="Back to services"
            className="text-white/80 hover:text-white"
          >
            ←
          </button>
        )}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm">
          🤖
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{businessName}</div>
          <div className="flex items-center gap-1 text-[11px] opacity-90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> AI Assistant Online
          </div>
        </div>
      </div>

      {stage === "select" ? (
        /* ── Service selection step ─────────────────────────── */
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-lg font-bold text-gray-900">Select a Service</h3>
          <p className="text-sm text-gray-500">Choose what you need help with</p>
          <div className="mt-4 space-y-2.5">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => pickService(s)}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                  style={{ backgroundColor: `${accentColor}1a`, color: accentColor }}
                >
                  🗓
                </span>
                <span>
                  <span className="block font-semibold text-gray-900">{s.name}</span>
                  <span className="text-xs text-gray-500">
                    🕐 {s.duration_minutes} min{s.price != null ? ` · $${s.price}` : ""}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStage("chat")}
            className="mt-4 w-full text-center text-sm text-gray-500 underline"
          >
            Or just ask a question
          </button>
        </div>
      ) : (
        /* ── Chat ───────────────────────────────────────────── */
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user" ? "text-white" : "bg-gray-100 text-gray-900"
                  }`}
                  style={m.role === "user" ? { backgroundColor: accentColor } : undefined}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400">Typing…</div>}
            <div ref={endRef} />
          </div>
          <div className="flex gap-2 border-t border-gray-100 p-3">
            <input
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText(input)}
            />
            <button
              onClick={() => sendText(input)}
              disabled={loading}
              className="rounded-xl px-4 text-sm font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
