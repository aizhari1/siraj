-- Social connections for Meta (Facebook pages + Instagram business accounts).
-- Tokens are server-only; never exposed to the client.

create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('meta')),
  platform text not null check (platform in ('facebook_page', 'instagram_business')),
  external_id text not null,
  name text not null default '',
  username text,
  avatar_url text,
  page_id text,
  -- encrypted or server-only; service role / admin RLS only
  access_token text not null,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  meta jsonb not null default '{}'::jsonb,
  connected_by uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, platform, external_id)
);

create index if not exists social_connections_active_idx
  on public.social_connections (is_active) where is_active;

alter table public.social_connections enable row level security;

-- Only admins can read/write connections (tokens must not leak to anon/authenticated non-admin)
create policy social_connections_admin_all on public.social_connections
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.social_connections(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  caption text not null default '',
  media_paths text[] not null default '{}',
  scheduled_at timestamptz,
  published_at timestamptz,
  external_post_id text,
  error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_posts enable row level security;

create policy social_posts_admin_all on public.social_posts
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
