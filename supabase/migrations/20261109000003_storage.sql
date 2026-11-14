-- Storage bucket `siraj-media`.
-- The bucket is PUBLIC so files are served from the CDN by URL. File names are random UUIDs, and
-- unpublished records are hidden by RLS, so unpublished media is not discoverable.
-- Listing and all writes are restricted to admins by the policies below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'siraj-media', 'siraj-media', true, 52428800,
  array['image/png','image/jpeg','image/webp','image/avif','image/gif','image/x-icon',
        'image/vnd.microsoft.icon','video/mp4','video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists siraj_media_admin_select on storage.objects;
drop policy if exists siraj_media_admin_insert on storage.objects;
drop policy if exists siraj_media_admin_update on storage.objects;
drop policy if exists siraj_media_admin_delete on storage.objects;

create policy siraj_media_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'siraj-media' and (select public.is_admin()));

create policy siraj_media_admin_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'siraj-media' and (select public.is_admin())
    and (storage.foldername(name))[1] in ('projects','services','sections','branding','testimonials')
  );

create policy siraj_media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'siraj-media' and (select public.is_admin()))
  with check (
    bucket_id = 'siraj-media' and (select public.is_admin())
    and (storage.foldername(name))[1] in ('projects','services','sections','branding','testimonials')
  );

create policy siraj_media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'siraj-media' and (select public.is_admin()));
