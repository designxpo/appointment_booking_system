/**
 * Environment access with fail-fast validation and clear errors.
 *
 * We DON'T validate everything at import time, because:
 *   - DEV_MOCK mode needs no Supabase/Anthropic keys.
 *   - Public (NEXT_PUBLIC_*) vars are inlined at build and read directly.
 *
 * Instead, server code calls `requireEnv("NAME")` at the point of use, so a
 * missing key produces a precise message ("Missing required env: ANTHROPIC_API_KEY")
 * instead of a cryptic downstream crash.
 */

const cache = new Map<string, string>();

export function requireEnv(name: string): string {
  const cached = cache.get(name);
  if (cached !== undefined) return cached;

  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Add it to .env.local (see .env.example).`,
    );
  }
  cache.set(name, value);
  return value;
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

export const DEV_MOCK =
  process.env.NEXT_PUBLIC_DEV_MOCK === "true" &&
  process.env.NODE_ENV !== "production";

/** Anthropic / AI receptionist config. */
export const aiEnv = {
  get apiKey() {
    return requireEnv("ANTHROPIC_API_KEY");
  },
  get model() {
    return optionalEnv("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
  },
};

/**
 * Support / sales contact used by the client "Request upgrade" flow (subscriptions
 * are activated manually from the owner console). All optional with fallbacks.
 */
export const supportContact = {
  /** Email upgrade requests are sent to. */
  get email() {
    return optionalEnv("NEXT_PUBLIC_SUPPORT_EMAIL") ?? "sales@slotnest.ai";
  },
  /** WhatsApp number in international format WITHOUT '+', e.g. 919876543210. */
  get whatsapp() {
    return optionalEnv("NEXT_PUBLIC_SUPPORT_WHATSAPP");
  },
};

/** Shared secret guarding cron endpoints. */
export function cronSecret(): string | undefined {
  return optionalEnv("CRON_SECRET");
}

export const appUrl = () =>
  optionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
