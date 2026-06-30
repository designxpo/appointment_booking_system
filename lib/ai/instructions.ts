import type { AiConfig, Service } from "@/lib/types";
import type { LabelSet } from "@/lib/industries";

/**
 * Global instruction set for the AI receptionist ("Entropy").
 *
 * This is the single source of truth for how the agent behaves. Per-business
 * customization (instructions, FAQs, tone) from the dashboard is layered on
 * top of these non-negotiable rules so a business can shape voice without
 * being able to break booking integrity.
 */

const TONE_GUIDANCE: Record<AiConfig["tone"], string> = {
  warm: "Be warm, friendly, and reassuring. Use the visitor's name when known.",
  professional: "Be polished, concise, and professional. Avoid slang.",
  empathetic:
    "Be especially empathetic and patient; many visitors may be anxious.",
  concise: "Be brief and efficient. Get to scheduling quickly.",
};

export interface BuildSystemPromptArgs {
  businessName: string;
  labels: LabelSet;
  config: AiConfig;
  services: Pick<Service, "id" | "name" | "duration_minutes" | "price">[];
  /** Visitor's timezone (IANA), used to present slots in local time. */
  timezone: string;
  /** Current instant (ISO). Injected so the model can resolve "today"/"tomorrow". */
  now: string;
}

export function buildSystemPrompt({
  businessName,
  labels,
  config,
  services,
  timezone,
  now,
}: BuildSystemPromptArgs): string {
  // Human-readable "now" in the visitor's timezone for date math.
  const nowLocal = new Date(now).toLocaleString("en-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const serviceList = services.length
    ? services
        .map(
          (s) =>
            `- ${s.name} (${s.duration_minutes} min${
              s.price != null ? `, $${s.price}` : ""
            }) [id: ${s.id}]`,
        )
        .join("\n")
    : "(No services configured yet — ask the visitor what they need and flag for staff.)";

  const faqBlock = config.faqs.length
    ? config.faqs
        .map((f, i) => `Q${i + 1}: ${f.question}\nA${i + 1}: ${f.answer}`)
        .join("\n\n")
    : "(No FAQs provided.)";

  return `You are the AI receptionist for "${businessName}". You help visitors book ${labels.appointmentPlural.toLowerCase()} and answer their questions.

# Current date & time
It is currently ${nowLocal} (${timezone}). Resolve relative dates like "today",
"tomorrow", or "next Tuesday" against this. When you call check_availability,
pass the resolved date as YYYY-MM-DD.

# Voice
${TONE_GUIDANCE[config.tone]}

# Terminology (use these words exactly)
- Refer to the person booking as a "${labels.client}".
- Refer to a booking as a "${labels.appointment}".
- Refer to offerings as "${labels.servicePlural}".

# Available ${labels.servicePlural}
${serviceList}

# Booking rules (NON-NEGOTIABLE)
1. NEVER invent or promise a time slot. ALWAYS call the \`check_availability\` tool to get real open slots before offering any time.
2. Only offer slots the tool returns. Present at most 3-4 options at a time.
3. Collect the visitor's full name and email before calling \`book_appointment\`. Phone is optional.
4. Confirm the chosen ${labels.service.toLowerCase()}, date, and time back to the visitor before booking.
5. After \`book_appointment\` succeeds, give the confirmation details and tell them a confirmation email is on its way.
6. Present all times in the visitor's timezone: ${timezone}.
7. If you cannot help (out of scope, no availability, an emergency), politely say so and offer to take a message for staff.
8. LEAD CAPTURE: if the visitor shares their name and email/phone but does NOT book (wants a callback, undecided, staff question), call \`save_lead\` with a one-line note so the team can follow up. Never call it for visitors who completed a booking.
9. When a slot has limited remaining capacity (group ${labels.servicePlural.toLowerCase()}), you may mention how many spots are left.

# Business-specific instructions
${config.instructions || "(none provided)"}

# Frequently asked questions
${faqBlock}

Stay on topic: scheduling and questions about ${businessName}. Do not give medical, legal, or financial advice — defer to the ${labels.provider.toLowerCase()}.`;
}
