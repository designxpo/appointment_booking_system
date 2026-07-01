"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAnthropic, RECEPTIONIST_TOOLS } from "@/lib/ai/client";
import {
  runOpenAiCompatibleTurn,
  type ToolDispatcher,
} from "@/lib/ai/openai-compat";
import { providerDef, resolveBaseUrl } from "@/lib/ai/providers";
import { buildSystemPrompt } from "@/lib/ai/instructions";
import {
  computeAvailableSlots,
  utcWindowForLocalDate,
} from "@/lib/availability";
import { settingsFromRow } from "@/lib/settings-map";
import { getLabels } from "@/lib/industries";
import { bookAppointment } from "@/action/appointments";
import type { AiConfig, Settings } from "@/lib/types";

/**
 * One turn of the AI receptionist conversation.
 *
 * The widget posts the full message history + clinic id. We load the clinic's
 * AI config/services/labels, build the system prompt, and run an agentic loop:
 * the model may call check_availability / book_appointment / save_lead, we
 * execute them server-side against Supabase, feed results back, and continue
 * until the model produces a text reply for the visitor.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_TOOL_ITERATIONS = 6;

interface ServiceRow {
  id: string;
  name: string;
  duration_minutes: number;
  buffer_minutes: number;
  capacity: number;
  price: number | null;
}

export async function receptionistTurn(args: {
  clinicId: string;
  messages: ChatMessage[];
  timezone?: string;
}): Promise<{ reply: string; bookedAppointmentId?: string } | { error: string }> {
  const admin = createAdminClient();

  const [{ data: profile }, { data: cfg }, { data: services }, { data: setRow }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("business_name, industry, role")
        .eq("id", args.clinicId)
        .single(),
      admin.from("ai_configs").select("*").eq("clinic_id", args.clinicId).single(),
      admin
        .from("services")
        .select("id, name, duration_minutes, buffer_minutes, capacity, price")
        .eq("clinic_id", args.clinicId)
        .eq("is_active", true),
      admin.from("settings").select("*").eq("clinic_id", args.clinicId).single(),
    ]);

  if (!profile || !cfg || !setRow) {
    return { error: "This receptionist is not available right now." };
  }

  // Untyped client can't infer the column list; assert the runtime shape.
  const serviceRows = (services ?? []) as unknown as ServiceRow[];

  const labels = getLabels(profile.industry, profile.role);
  const config: AiConfig = {
    clinic_id: args.clinicId,
    instructions: cfg.instructions,
    faqs: cfg.faqs,
    knowledge_base: cfg.knowledge_base ?? "",
    tone: cfg.tone as AiConfig["tone"],
    widget_color: cfg.widget_color,
    welcome_message: cfg.welcome_message ?? "",
    session_duration_minutes: cfg.session_duration_minutes,
    ai_provider: (cfg.ai_provider as AiConfig["ai_provider"]) ?? "slotnest",
    ai_model: cfg.ai_model ?? null,
    ai_base_url: cfg.ai_base_url ?? null,
    has_api_key: Boolean(cfg.ai_api_key),
  };
  const settings = settingsFromRow(args.clinicId, setRow);
  const timezone = args.timezone || settings.timezone || "UTC";

  const system = buildSystemPrompt({
    businessName: profile.business_name,
    labels,
    config,
    services: serviceRows,
    timezone,
    now: new Date().toISOString(),
  });

  // Each business runs its assistant on its OWN AI key (connected in AI Settings).
  // Any provider works: Anthropic uses the native SDK; everything else goes
  // through the OpenAI-compatible driver. No key connected → assistant inactive.
  const def = providerDef(cfg.ai_provider);
  if (!def || !cfg.ai_api_key) {
    return { error: "This assistant isn't set up yet. Please try again later." };
  }
  const model = cfg.ai_model?.trim() || def.defaultModel;

  const ctx = { clinicId: args.clinicId, services: serviceRows, settings };
  const dispatchTool: ToolDispatcher = (name, input) => runTool(name, input, ctx);

  try {
    if (def.kind === "anthropic") {
      return await runAnthropicTurn({
        apiKey: cfg.ai_api_key,
        model,
        system,
        messages: args.messages,
        dispatchTool,
      });
    }

    const baseUrl = resolveBaseUrl(cfg.ai_provider, cfg.ai_base_url);
    if (!baseUrl || !model) {
      return { error: "This assistant isn't set up yet. Please try again later." };
    }
    return await runOpenAiCompatibleTurn({
      baseUrl,
      apiKey: cfg.ai_api_key,
      model,
      system,
      messages: args.messages,
      dispatchTool,
    });
  } catch {
    return {
      error: "The AI assistant hit an error. Please check the API key and model in AI Settings.",
    };
  }
}

/** Native Anthropic (Claude) driver — tool-use loop over the Messages API. */
async function runAnthropicTurn(opts: {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatMessage[];
  dispatchTool: ToolDispatcher;
}): Promise<{ reply: string; bookedAppointmentId?: string }> {
  const anthropic = getAnthropic(opts.apiKey);
  const convo: Anthropic.MessageParam[] = opts.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let bookedAppointmentId: string | undefined;

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const res = await anthropic.messages.create({
      model: opts.model,
      max_tokens: 1024,
      system: opts.system,
      tools: RECEPTIONIST_TOOLS,
      messages: convo,
    });

    const toolUses = res.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    if (res.stop_reason !== "tool_use" || toolUses.length === 0) {
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { reply: text || "Sorry, could you rephrase that?", bookedAppointmentId };
    }

    convo.push({ role: "assistant", content: res.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      const out = await opts.dispatchTool(tu.name, tu.input as Record<string, unknown>);
      if (out.bookedId) bookedAppointmentId = out.bookedId;
      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: out.content,
        is_error: out.isError,
      });
    }
    convo.push({ role: "user", content: toolResults });
  }

  return { reply: "Let me connect you with our staff to finish booking." };
}

async function runTool(
  name: string,
  input: Record<string, unknown>,
  ctx: { clinicId: string; services: ServiceRow[]; settings: Settings },
): Promise<{ content: string; isError?: boolean; bookedId?: string }> {
  const admin = createAdminClient();

  if (name === "check_availability") {
    const serviceId = String(input.service_id ?? "");
    const date = String(input.date ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { content: "Invalid date — use YYYY-MM-DD.", isError: true };
    }
    const service = ctx.services.find((s) => s.id === serviceId);
    if (!service) return { content: "Unknown service.", isError: true };

    const window = utcWindowForLocalDate(date, ctx.settings.timezone);
    const { data: dayAppts } = await admin
      .from("appointments")
      .select("starts_at, ends_at, status, service_id")
      .eq("clinic_id", ctx.clinicId)
      .gte("starts_at", window.fromISO)
      .lte("starts_at", window.toISO);

    const slots = computeAvailableSlots({
      date,
      service,
      settings: ctx.settings,
      appointments: dayAppts ?? [],
      now: new Date().toISOString(),
    });

    return {
      content: JSON.stringify({
        date,
        service: service.name,
        timezone: ctx.settings.timezone,
        open_slots: slots.slice(0, 8).map((s) => ({
          starts_at: s.startsAt,
          spots_left: s.remaining,
        })),
      }),
    };
  }

  if (name === "book_appointment") {
    const result = await bookAppointment({
      clinicId: ctx.clinicId,
      serviceId: String(input.service_id ?? ""),
      clientName: String(input.client_name ?? ""),
      clientEmail: String(input.client_email ?? ""),
      clientPhone: input.client_phone ? String(input.client_phone) : null,
      startsAt: String(input.starts_at ?? ""),
      notes: input.notes ? String(input.notes) : null,
    });
    if ("error" in result && result.error) {
      return { content: result.error, isError: true };
    }
    return {
      content: JSON.stringify({ booked: true, id: result.appointmentId }),
      bookedId: result.appointmentId,
    };
  }

  if (name === "save_lead") {
    const leadName = String(input.name ?? "").slice(0, 120);
    const email = input.email ? String(input.email).slice(0, 200) : null;
    const phone = input.phone ? String(input.phone).slice(0, 40) : null;
    const note = input.note ? String(input.note).slice(0, 500) : null;
    if (!leadName) return { content: "Lead needs a name.", isError: true };
    if (!email && !phone) {
      return { content: "Lead needs an email or phone.", isError: true };
    }

    const { error } = await admin.from("leads").upsert(
      {
        clinic_id: ctx.clinicId,
        name: leadName,
        email,
        phone,
        source: "ai_chat",
        status: "new",
        notes: note,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clinic_id,email" },
    );
    if (error) return { content: error.message, isError: true };
    return { content: JSON.stringify({ saved: true }) };
  }

  return { content: `Unknown tool: ${name}`, isError: true };
}
