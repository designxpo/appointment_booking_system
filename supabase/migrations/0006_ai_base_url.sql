-- ============================================================================
-- Slotnest — custom AI endpoint support
-- Businesses can connect ANY AI provider. Known providers resolve their base
-- URL automatically; a "custom" OpenAI-compatible endpoint is stored here.
-- Idempotent.
-- ============================================================================

alter table public.ai_configs
  add column if not exists ai_base_url text;
