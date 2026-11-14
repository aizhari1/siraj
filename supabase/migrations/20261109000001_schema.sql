-- SIRAJ schema: tables, constraints, indexes, triggers.
-- RLS and grants live in 20261109000002_rls.sql.

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'pending' check (role in ('admin', 'pending')),
  full_name  text check (full_name is null or char_length(full_name) <= 120),
  created_at timestamptz not null default now()
);

-- Every auth user gets a profile with NO privileges. An admin is promoted manually (see README).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(new.raw_user_meta_data ->> 'full_name', 120));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- projects
create table public.projects (
  id                 uuid primary key default gen_random_uuid(),
  title_ar           text not null check (char_length(title_ar) between 1 and 200),
  title_en           text not null check (char_length(title_en) between 1 and 200),
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  category           text not null default 'general' check (char_length(category) between 1 and 80),
  description_ar     text,
  description_en     text,
  client_name        text check (client_name is null or char_length(client_name) <= 160),
  challenge_ar       text,
  challenge_en       text,
  solution_ar        text,
  solution_en        text,
  results_ar         text,
  results_en         text,
  cover_image        text,
  gallery            jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery) = 'array'),
  video_url          text,
  external_url       text check (external_url is null or external_url ~* '^https?://'),
  seo_title_ar       text check (seo_title_ar is null or char_length(seo_title_ar) <= 70),
  seo_title_en       text check (seo_title_en is null or char_length(seo_title_en) <= 70),
  seo_description_ar text check (seo_description_ar is null or char_length(seo_description_ar) <= 170),
  seo_description_en text check (seo_description_en is null or char_length(seo_description_en) <= 170),
  is_featured        boolean not null default false,
  is_published       boolean not null default false,
  display_order      integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index projects_public_idx   on public.projects (display_order, created_at desc) where is_published;
create index projects_featured_idx on public.projects (display_order) where is_published and is_featured;
create index projects_category_idx on public.projects (category);
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- services
create table public.services (
  id             uuid primary key default gen_random_uuid(),
  title_ar       text not null check (char_length(title_ar) between 1 and 200),
  title_en       text not null check (char_length(title_en) between 1 and 200),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  description_ar text,
  description_en text,
  icon           text,
  image          text,
  features       jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  is_published   boolean not null default false,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index services_public_idx on public.services (display_order) where is_published;
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- sections
create table public.sections (
  id            uuid primary key default gen_random_uuid(),
  section_type  text not null check (section_type in (
    'hero','text_image','services_grid','projects_grid','video_showcase','statistics',
    'testimonials','faq','logo_wall','process_timeline','cta','custom_content')),
  title         text not null default '' check (char_length(title) <= 160),
  content       jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  settings      jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  is_enabled    boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index sections_public_idx on public.sections (display_order) where is_enabled;
create trigger sections_updated_at before update on public.sections
  for each row execute function public.set_updated_at();

create table public.section_drafts (
  section_id uuid primary key references public.sections(id) on delete cascade,
  title      text not null default '' check (char_length(title) <= 160),
  content    jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  settings   jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create trigger section_drafts_updated_at before update on public.section_drafts
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------ testimonials
create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  client_name   text not null check (char_length(client_name) between 1 and 160),
  company       text check (company is null or char_length(company) <= 160),
  position      text check (position is null or char_length(position) <= 160),
  content_ar    text not null default '',
  content_en    text not null default '',
  image         text,
  is_published  boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  check (char_length(content_ar) > 0 or char_length(content_en) > 0)
);
create index testimonials_public_idx on public.testimonials (display_order) where is_published;

-- ----------------------------------------------------------- site_settings
create table public.site_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique check (key ~ '^[a-z0-9_.]+$' and char_length(key) <= 80),
  value      jsonb not null default '{}'::jsonb,
  is_public  boolean not null default true,
  updated_at timestamptz not null default now()
);
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------- media
create table public.media (
  id          uuid primary key default gen_random_uuid(),
  path        text not null unique
              check (path ~ '^(projects|services|sections|branding|testimonials)/[^/]+$'),
  alt_ar      text check (alt_ar is null or char_length(alt_ar) <= 300),
  alt_en      text check (alt_en is null or char_length(alt_en) <= 300),
  mime_type   text,
  size_bytes  bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index media_folder_idx on public.media (created_at desc);

-- --------------------------------------------------------------- inquiries
create table public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 160),
  company    text check (company is null or char_length(company) <= 160),
  country    text check (country is null or char_length(country) <= 80),
  email      text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  whatsapp   text check (whatsapp is null or whatsapp ~ '^\+?[0-9 ()-]{6,24}$'),
  service    text check (service is null or char_length(service) <= 160),
  budget     text check (budget is null or char_length(budget) <= 80),
  details    text not null check (char_length(details) between 10 and 5000),
  status     text not null default 'new' check (status in ('new','read','replied','archived')),
  created_at timestamptz not null default now()
);
create index inquiries_status_idx on public.inquiries (status, created_at desc);
