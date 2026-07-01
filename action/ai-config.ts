"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { aiConfigSchema } from "@/lib/validation";
import { providerDef } from "@/lib/ai/providers";
import type { AiProvider } from "@/lib/types";

/** Saves the AI receptionist configuration (instructions, FAQs, tone, widget). */
export async function saveAiConfig(raw: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = aiConfigSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  const { error } = await supabase
    .from("ai_configs")
    .update({
      instructions: d.instructions,
      knowledge_base: d.knowledgeBase,
      faqs: d.faqs,
      tone: d.tone,
      widget_color: d.widgetColor,
      welcome_message: d.welcomeMessage,
      session_duration_minutes: d.sessionDurationMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq("clinic_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/ai");
  return { ok: true };
}

/**
 * Connects (or clears) the business's own AI provider key. Available on every
 * plan — each business runs its assistant on its own key, using ANY provider
 * (Anthropic natively; everything else via the OpenAI-compatible API). The raw
 * key is stored server-side and never returned to the client.
 */
export async function saveAiKey(input: {
  provider: AiProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // "slotnest" here means "disconnect" — clear the stored key (AI goes inactive).
  if (input.provider === "slotnest") {
    const { error } = await supabase
      .from("ai_configs")
      .update({
        ai_provider: "slotnest",
        ai_api_key: null,
        ai_model: null,
        ai_base_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("clinic_id", user.id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/ai");
    return { ok: true };
  }

  const def = providerDef(input.provider);
  if (!def) return { error: "Unknown AI provider." };

  const model = (input.model ?? "").trim() || null;

  // Custom OpenAI-compatible endpoints need a base URL.
  let baseUrl: string | null = null;
  if (def.needsBaseUrl) {
    baseUrl = (input.baseUrl ?? "").trim() || null;
    if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
      return { error: "Enter a valid base URL (starting with https://) for the custom endpoint." };
    }
  }

  const key = (input.apiKey ?? "").trim();
  const update: {
    ai_provider: string;
    ai_model: string | null;
    ai_base_url: string | null;
    updated_at: string;
    ai_api_key?: string;
  } = {
    ai_provider: input.provider,
    ai_model: model,
    ai_base_url: baseUrl,
    updated_at: new Date().toISOString(),
  };

  if (key) {
    if (key.length < 15) return { error: "That doesn't look like a valid API key." };
    update.ai_api_key = key;
  } else {
    // No new key entered — only allowed if one is already stored.
    const { data: existing } = await supabase
      .from("ai_configs")
      .select("ai_api_key")
      .eq("clinic_id", user.id)
      .single();
    if (!existing?.ai_api_key) {
      return { error: "Enter your API key to activate your assistant." };
    }
  }

  const { error } = await supabase
    .from("ai_configs")
    .update(update)
    .eq("clinic_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/ai");
  return { ok: true };
}
