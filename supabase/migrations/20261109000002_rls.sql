-- Row Level Security. Default stance: deny. Visitors read published content only.

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles       enable row level security;
alter table public.projects       enable row level security;
alter table public.services       enable row level security;
alter table public.sections       enable row level security;
alter table public.section_drafts enable row level security;
alter table public.testimonials   enable row level security;
alter table public.site_settings  enable row level security;
alter table public.media          enable row level security;
alter table public.inquiries      enable row level security;

-- Table privileges (defense in depth on top of RLS)
revoke all on public.profiles, public.projects, public.services, public.sections,
  public.section_drafts, public.testimonials, public.site_settings, public.media,
  public.inquiries from anon, authenticated;

grant select on public.projects, public.services, public.sections, public.testimonials,
  public.site_settings, public.media to anon, authenticated;
grant insert, update, delete on public.projects, public.services, public.sections,
  public.testimonials, public.site_settings, public.media to authenticated;
grant select, insert, update, delete on public.section_drafts to authenticated;
grant select, update on public.profiles to authenticated;
grant insert on public.inquiries to anon, authenticated;
grant select, update, delete on public.inquiries to authenticated;

-- profiles: read your own row (needed for role checks); admins read/update all. No client inserts.
create policy profiles_self_read   on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_admin_read  on public.profiles for select to authenticated
  using ((select public.is_admin()));
create policy profiles_admin_write on public.profiles for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Public read of published content
create policy projects_public_read     on public.projects     for select to anon, authenticated using (is_published);
create policy services_public_read     on public.services     for select to anon, authenticated using (is_published);
create policy sections_public_read     on public.sections     for select to anon, authenticated using (is_enabled);
create policy testimonials_public_read on public.testimonials for select to anon, authenticated using (is_published);
create policy settings_public_read     on public.site_settings for select to anon, authenticated using (is_public);
create policy media_public_read        on public.media        for select to anon, authenticated using (true);

-- Admin full access
create policy projects_admin     on public.projects       for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy services_admin     on public.services       for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy sections_admin     on public.sections       for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy drafts_admin       on public.section_drafts for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy testimonials_admin on public.testimonials  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy settings_admin     on public.site_settings  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy media_admin        on public.media          for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Inquiries: anyone may submit (column checks enforce shape); only admins read or manage.
create policy inquiries_submit on public.inquiries for insert to anon, authenticated
  with check (status = 'new');
create policy inquiries_admin_read   on public.inquiries for select to authenticated using ((select public.is_admin()));
create policy inquiries_admin_update on public.inquiries for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy inquiries_admin_delete on public.inquiries for delete to authenticated using ((select public.is_admin()));

-- Media library: "delete only when not in use". Runs as the caller, so RLS applies (admins see everything).
create or replace function public.media_in_use(p text)
returns boolean language sql stable set search_path = '' as $$
  select
    exists (select 1 from public.projects     where cover_image = p or position(p in gallery::text) > 0 or position(p in coalesce(video_url, '')) > 0)
 or exists (select 1 from public.services     where image = p or position(p in features::text) > 0)
 or exists (select 1 from public.testimonials where image = p)
 or exists (select 1 from public.sections     where position(p in content::text) > 0 or position(p in settings::text) > 0)
 or exists (select 1 from public.section_drafts where position(p in content::text) > 0 or position(p in settings::text) > 0)
 or exists (select 1 from public.site_settings where position(p in value::text) > 0);
$$;
revoke all on function public.media_in_use(text) from public;
grant execute on function public.media_in_use(text) to authenticated;
