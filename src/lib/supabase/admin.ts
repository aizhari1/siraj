import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Service-role client. Server-only: the "server-only" import makes the build fail if a client component imports this. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
