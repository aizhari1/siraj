# SIRAJ | سِراج — Agency website

Next.js (App Router) + Supabase + Vercel. Bilingual (AR/EN, RTL/LTR), editable from `/admin`.

## Setup
1. `npm install`
2. Create a Supabase project. Copy `.env.example` to `.env.local` and fill in the URL, anon key and service-role key.
3. Apply the migrations in `supabase/migrations/` in order (Supabase CLI: `supabase link` then `supabase db push`, or paste each file into the SQL editor).
4. Auth: public sign-up is disabled (`supabase/config.toml`, and in the dashboard under Authentication > Providers > Email turn off "Allow new users to sign up").
5. Create your admin user in Authentication > Users, then promote it:
   ```sql
   update public.profiles set role = 'admin' where id = '<USER-UUID>';
   ```
6. `npm run dev`

## Deploy to Vercel
1. Push this repo to GitHub and import it in Vercel (Framework: Next.js).
2. Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Deploy.
