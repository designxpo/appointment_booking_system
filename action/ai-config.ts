"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { aiConfigSchema } from "@/lib/validation";

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
