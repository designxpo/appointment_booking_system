-- ============================================================================
-- Slotnest — Storage buckets & policies
-- Run AFTER rls.sql.
--
-- Bucket `website-images` holds CMS-uploaded assets (hero images, etc.).
-- Public read (so the published booking site can show them); writes restricted
-- to the owning clinic, keyed by a top-level folder = clinic_id.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('website-images', 'website-images', true)
on conflict (id) do nothing;

-- Anyone can view images (public site).
create policy "public reads website images"
  on storage.objects for select
  using (bucket_id = 'website-images');

-- A clinic owner may upload/update/delete only within their own folder:
--   website-images/<clinic_id>/<file>
create policy "owner writes own website images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'website-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner updates own website images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'website-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner deletes own website images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'website-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
