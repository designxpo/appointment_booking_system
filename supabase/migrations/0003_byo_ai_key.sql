-- ============================================================================
-- Slotnest — Bring Your Own AI key
-- Businesses on Professional/Business can power the AI receptionist with their
-- own AI provider key. Stored on ai_configs (server-only; never returned to the
-- browser). ai_provider: 'slotnest' (managed, default) | 'anthropic' (BYOK).
-- Idempotent.
-- ============================================================================

alter table public.ai_configs
  add column if not exists ai_provider text not null default 'slotnest',
  add column if not exists ai_api_key  text,
  add column if not exists ai_model    text;

-- Advertise the feature on the paid tiers (idempotent: only append if missing).
update public.plan_configs
   set features = features || '["Bring your own AI key"]'::jsonb,
       updated_at = now()
 where tier in ('professional', 'enterprise')
   and not (features @> '["Bring your own AI key"]'::jsonb);
