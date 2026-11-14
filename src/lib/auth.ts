import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Server-side gate. Call at the top of every admin page AND every server action.
 *  The database enforces the same rule through RLS, so this is defense in depth. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/admin/unauthorized");

  return { supabase, user, profile };
}
