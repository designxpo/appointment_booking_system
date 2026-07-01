/**
 * AI provider registry — the businesses can run their receptionist on ANY of
 * these. "anthropic" uses the native Claude SDK; everything else speaks the
 * OpenAI-compatible Chat Completions API (function calling included), which
 * covers OpenAI, Gemini, Groq, Mistral, OpenRouter, DeepSeek, xAI, Together,
 * local servers, and any other OpenAI-compatible endpoint via "custom".
 *
 * Plain data — safe to import from both client and server.
 */
export type AiProviderKind = "anthropic" | "openai";

export interface AiProviderDef {
  label: string;
  kind: AiProviderKind;
  /** OpenAI-compatible base URL. Omitted for Anthropic and for "custom". */
  baseUrl?: string;
  defaultModel: string;
  /** Example key prefix, shown as the input placeholder. */
  keyHint?: string;
  /** Custom provider — the business supplies the base URL. */
  needsBaseUrl?: boolean;
  /** Where to get a key. */
  keysUrl?: string;
}

export const AI_PROVIDERS: Record<string, AiProviderDef> = {
  anthropic: {
    label: "Anthropic — Claude",
    kind: "anthropic",
    defaultModel: "claude-sonnet-4-6",
    keyHint: "sk-ant-…",
    keysUrl: "https://console.anthropic.com/settings/keys",
  },
  openai: {
    label: "OpenAI — GPT",
    kind: "openai",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    keyHint: "sk-…",
    keysUrl: "https://platform.openai.com/api-keys",
  },
  google: {
    label: "Google — Gemini",
    kind: "openai",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModel: "gemini-2.0-flash",
    keyHint: "AIza…",
    keysUrl: "https://aistudio.google.com/app/apikey",
  },
  groq: {
    label: "Groq (Llama, Mixtral)",
    kind: "openai",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    keysUrl: "https://console.groq.com/keys",
  },
  mistral: {
    label: "Mistral AI",
    kind: "openai",
    baseUrl: "https://api.mistral.ai/v1",
    defaultModel: "mistral-large-latest",
    keysUrl: "https://console.mistral.ai/api-keys",
  },
  deepseek: {
    label: "DeepSeek",
    kind: "openai",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    keysUrl: "https://platform.deepseek.com/api_keys",
  },
  xai: {
    label: "xAI — Grok",
    kind: "openai",
    baseUrl: "https://api.x.ai/v1",
    defaultModel: "grok-2-latest",
    keysUrl: "https://console.x.ai",
  },
  openrouter: {
    label: "OpenRouter (any model)",
    kind: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    keysUrl: "https://openrouter.ai/keys",
  },
  together: {
    label: "Together AI",
    kind: "openai",
    baseUrl: "https://api.together.xyz/v1",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    keysUrl: "https://api.together.xyz/settings/api-keys",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    kind: "openai",
    defaultModel: "",
    needsBaseUrl: true,
  },
};

/** Provider keys in display order for the picker. */
export const AI_PROVIDER_KEYS = Object.keys(AI_PROVIDERS);

export function providerDef(provider: string): AiProviderDef | undefined {
  return AI_PROVIDERS[provider];
}

/** Resolve the OpenAI-compatible base URL for a provider (custom uses the stored one). */
export function resolveBaseUrl(provider: string, storedBaseUrl?: string | null): string | null {
  const def = AI_PROVIDERS[provider];
  if (!def) return null;
  if (def.needsBaseUrl) return storedBaseUrl?.trim() || null;
  return def.baseUrl ?? null;
}
