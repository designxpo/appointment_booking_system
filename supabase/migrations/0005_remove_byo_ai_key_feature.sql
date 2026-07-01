-- ============================================================================
-- Slotnest — remove the "Bring your own AI key" feature from the product
-- Stop advertising it on the paid tiers. The ai_configs columns (ai_provider,
-- ai_api_key, ai_model) are left in place, unused, so no data is lost and it can
-- be re-enabled later; they simply default to the Slotnest-managed engine.
-- Idempotent.
-- ============================================================================

update public.plan_configs
   set features = (
         select coalesce(jsonb_agg(f), '[]'::jsonb)
           from jsonb_array_elements(features) as f
          where f <> '"Bring your own AI key"'::jsonb
       ),
       updated_at = now()
 where features @> '["Bring your own AI key"]'::jsonb;
