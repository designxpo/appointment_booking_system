-- ============================================================================
-- Slotnest — AI knowledge base
-- Businesses paste everything the AI should know (services, pricing, policies,
-- location, hours, staff, FAQs in prose…). The receptionist is instructed to
-- answer ONLY from this + FAQs + live booking data, and never invent details.
-- Idempotent.
-- ============================================================================

alter table public.ai_configs
  add column if not exists knowledge_base text not null default '';
