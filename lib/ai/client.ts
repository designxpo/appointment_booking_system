import Anthropic from "@anthropic-ai/sdk";
import { aiEnv } from "@/lib/env";

/**
 * Anthropic Claude client — the engine behind the "Entropy" AI receptionist.
 * Server-only: requires ANTHROPIC_API_KEY. Never import into client code.
 */
let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: aiEnv.apiKey });
  }
  return _client;
}

export const AI_MODEL = aiEnv.model;

/**
 * Tool definitions exposed to the receptionist. The agent calls these to
 * touch real data; the application layer executes them against Supabase so
 * the model can never write directly to the database.
 */
export const RECEPTIONIST_TOOLS: Anthropic.Tool[] = [
  {
    name: "check_availability",
    description:
      "Return real open appointment slots for a given service and date. Always call this before offering any time to the visitor.",
    input_schema: {
      type: "object",
      properties: {
        service_id: {
          type: "string",
          description: "The id of the service the visitor wants.",
        },
        date: {
          type: "string",
          description: "Target date in YYYY-MM-DD format.",
        },
      },
      required: ["service_id", "date"],
    },
  },
  {
    name: "save_lead",
    description:
      "Save the visitor's contact details as a lead for the business, even if they don't book. Call this whenever a visitor shares their name plus an email or phone number but is not ready to book (wants a callback, has a question for staff, will decide later).",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        note: {
          type: "string",
          description: "One sentence on what the visitor wanted.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "book_appointment",
    description:
      "Create a confirmed appointment in a slot previously returned by check_availability. Only call once you have the visitor's name and email and they confirmed the time.",
    input_schema: {
      type: "object",
      properties: {
        service_id: { type: "string" },
        starts_at: {
          type: "string",
          description: "ISO 8601 start datetime of the chosen slot.",
        },
        client_name: { type: "string" },
        client_email: { type: "string" },
        client_phone: { type: "string" },
        notes: { type: "string" },
      },
      required: ["service_id", "starts_at", "client_name", "client_email"],
    },
  },
];
