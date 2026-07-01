-- ============================================================================
-- Slotnest — remove the Free tier as a sellable plan
-- The `free` plan_tier enum value is KEPT: it is the internal "no active
-- subscription" state a business falls back to after its trial ends or a paid
-- plan lapses. We only stop OFFERING it — deactivate it so it disappears from
-- the marketing pricing and client billing, leaving Starter/Professional/
-- Business as the purchasable plans. The owner can re-enable it from the
-- console (plan_configs.is_active) if they ever want a free plan back.
-- Idempotent.
-- ============================================================================

update public.plan_configs
   set is_active = false,
       appointment_cap = 0,
       tagline = 'No active subscription',
       updated_at = now()
 where tier = 'free';
