"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { buildMetaOAuthUrl, metaAppConfigured } from "@/lib/social/meta";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

export async function startMetaConnect() {
  await requireAdmin();
  if (!metaAppConfigured()) {
    redirect("/admin/social?error=" + encodeURIComponent("Meta App is not configured"));
  }
  const state = crypto.randomUUID();
  const jar = await cookies();
  jar.set("meta_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  const redirectUri = `${siteUrl()}/api/social/meta/callback`;
  redirect(buildMetaOAuthUrl(state, redirectUri));
}

export async function disconnectSocial(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("social_connections").update({ is_active: false, access_token: "" }).eq("id", id);
  revalidatePath("/admin/social");
}
