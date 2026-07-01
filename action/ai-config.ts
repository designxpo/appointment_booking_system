"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { aiConfigSchema } from "@/lib/validation";
import { effectiveTier } from "@/lib/subscription";
import { canUseCustomAiKey } from "@/lib/plans";
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
 * Saves the "bring your own AI key" settings. Gated to Professional+ (and the
 * trial). The raw key is stored server-side and never returned to the client.
 * Providers other than Anthropic are accepted in the UI but not yet executed.
 */
const SUPPORTED_PROVIDERS: AiProvider[] = ["slotnest", "anthropic"];

export async function saveAiKey(input: {
  provider: AiProvider;
  apiKey?: string;
  model?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, trial_ends_at, plan_expires_at")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "Profile not found" };
  if (!canUseCustomAiKey(effectiveTier(profile))) {
    return { error: "Upgrade to Professional to use your own AI key." };
  }

  if (!SUPPORTED_PROVIDERS.includes(input.provider)) {
    return { error: "That provider isn't available yet — Anthropic (Claude) is supported today." };
  }

  // "slotnest" = managed engine: clear any stored key.
  if (input.provider === "slotnest") {
    const { error } = await supabase
      .from("ai_configs")
      .update({ ai_provider: "slotnest", ai_api_key: null, ai_model: null, updated_at: new Date().toISOString() })
      .eq("clinic_id", user.id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/ai");
    return { ok: true };
  }

  // BYO Anthropic key.
  const key = (input.apiKey ?? "").trim();
  const model = (input.model ?? "").trim() || null;

  const update: {
    ai_provider: string;
    ai_model: string | null;
    updated_at: string;
    ai_api_key?: string;
  } = { ai_provider: input.provider, ai_model: model, updated_at: new Date().toISOString() };

  if (key) {
    if (key.length < 20) return { error: "That doesn't look like a valid API key." };
    update.ai_api_key = key;
  } else {
    // No new key entered — only allowed if one is already stored.
    const { data: existing } = await supabase
      .from("ai_configs")
      .select("ai_api_key")
      .eq("clinic_id", user.id)
      .single();
    if (!existing?.ai_api_key) {
      return { error: "Enter your API key to enable your own AI engine." };
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
