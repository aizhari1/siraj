# Siraj

Next.js marketing site + CMS for a creative agency.

## Stack

- **Next.js 15** (App Router)
- **Supabase** (Postgres, Auth, Storage, RLS)
- **React Three Fiber** for the 3D world
- **Tailwind CSS**
- Multi-locale (`ar` / `en`)

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Scope | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anon / publishable key |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical site URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key (never expose) |

## Deploy (Vercel)

1. Connect the GitHub repo to Vercel.
2. Add the environment variables in Project Settings.
3. Deploy.

After deploy, run the Supabase migrations against your project if not already applied.

## Admin

Admin lives at `/admin`. Login uses Supabase Auth. Ensure RLS policies and seed data are applied.
