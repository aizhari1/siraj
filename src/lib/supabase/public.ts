import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Anonymous read-only client for public pages. No cookies, so pages can be cached and revalidated. RLS limits it to published rows. */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
