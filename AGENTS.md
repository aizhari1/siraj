# AGENTS.md

This file provides guidance to AI coding agents when working in this repository.

## Project Overview

Siraj is a Next.js 15 (App Router) marketing + CMS website for a creative agency, with:
- Multi-locale (ar / en) public site
- Admin dashboard for content, sections, media, settings, inquiries
- Supabase (Postgres + Storage + Auth + RLS)
- 3D world / orb experience (Three.js / React Three Fiber)
- Section-based page composition

## Key Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm run lint
```

## Environment

Copy `.env.example` to `.env.local` and fill in Supabase keys.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

## Structure

- `src/app/[locale]/` — public pages
- `src/app/admin/` — admin dashboard + login
- `src/components/sections/` — page section renderers
- `src/components/world/` — 3D scene
- `src/lib/` — data, i18n, supabase clients, catalogs
- `supabase/migrations/` — schema + RLS + seed

## Conventions

- Prefer Server Components; mark client components with `"use client"`
- Use the typed catalogs in `src/lib/sections/catalog.ts` and `src/lib/settings/catalog.ts`
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Keep Arabic (ar) as primary locale where relevant
