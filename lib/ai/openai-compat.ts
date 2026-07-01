import "server-only";
import { RECEPTIONIST_TOOLS } from "@/lib/ai/client";

/**
 * OpenAI-compatible Chat Completions driver for the AI receptionist. Works with
 * any provider that implements the standard /chat/completions endpoint with
 * function calling — OpenAI, Google Gemini, Groq, Mistral, OpenRouter, DeepSeek,
 * xAI, Together, local servers, etc. Uses raw fetch (no vendor SDK) and mirrors
 * the native Anthropic loop, sharing the same tool executors via `dispatchTool`.
 */

export interface ToolDispatchResult {
  content: string;
  isError?: boolean;
  bookedId?: string;
}
export type ToolDispatcher = (
  name: string,
  input: Record<string, unknown>,
) => Promise<ToolDispatchResult>;

const MAX_TOOL_ITERATIONS = 6;

// Same tools as the Anthropic path, in OpenAI function format (the JSON Schema
// is identical — only the wrapper differs).
const OPENAI_TOOLS = RECEPTIONIST_TOOLS.map((t) => ({
  type: "function" as const,
  function: {
    name: t.name,
    description: t.description,
    parameters: t.input_schema,
  },
}));

interface OaiToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}
interface OaiMessage {
  role: string;
  content: string | null;
  tool_calls?: OaiToolCall[];
  tool_call_id?: string;
}

export async function runOpenAiCompatibleTurn(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  dispatchTool: ToolDispatcher;
}): Promise<{ reply: string; bookedAppointmentId?: string }> {
  const url = `${opts.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const convo: OaiMessage[] = [
    { role: "system", content: opts.system },
    ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
  ];
  let bookedAppointmentId: string | undefined;

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      // Minimal body for maximum cross-provider compatibility (no temperature /
      // max_tokens, which some models reject).
      body: JSON.stringify({
        model: opts.model,
        messages: convo,
        tools: OPENAI_TOOLS,
        tool_choice: "auto",
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`AI provider ${res.status}: ${detail.slice(0, 300)}`);
    }

    const data = await res.json();
    const msg: OaiMessage | undefined = data?.choices?.[0]?.message;
    if (!msg) return { reply: "Sorry, could you rephrase that?", bookedAppointmentId };

    const toolCalls = msg.tool_calls ?? [];
    if (toolCalls.length === 0) {
      const text = (msg.content ?? "").trim();
      return { reply: text || "Sorry, could you rephrase that?", bookedAppointmentId };
    }

    // Push the assistant turn (with tool_calls), then each tool result.
    convo.push(msg);
    for (const tc of toolCalls) {
      let input: Record<string, unknown> = {};
      try {
        input = JSON.parse(tc.function.arguments || "{}");
      } catch {
        // Malformed args — dispatch with empty input; the tool validates.
      }
      const out = await opts.dispatchTool(tc.function.name, input);
      if (out.bookedId) bookedAppointmentId = out.bookedId;
      convo.push({ role: "tool", tool_call_id: tc.id, content: out.content });
    }
  }

  return { reply: "Let me connect you with our staff to finish booking." };
}
