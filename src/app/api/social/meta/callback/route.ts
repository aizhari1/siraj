import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForToken,
  exchangeForLongLivedUserToken,
  getInstagramProfile,
  listManagedPages,
} from "@/lib/social/meta";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error_description") || url.searchParams.get("error");

  const base = siteUrl() || url.origin;
  const fail = (msg: string) => NextResponse.redirect(`${base}/admin/social?error=${encodeURIComponent(msg)}`);

  if (err) return fail(err);
  if (!code || !state) return fail("Missing OAuth code");

  const jar = await cookies();
  const expected = jar.get("meta_oauth_state")?.value;
  jar.delete("meta_oauth_state");
  if (!expected || expected !== state) return fail("Invalid OAuth state");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Not signed in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return fail("Admin only");

  try {
    const redirectUri = `${base}/api/social/meta/callback`;
    const short = await exchangeCodeForToken(code, redirectUri);
    const longLived = await exchangeForLongLivedUserToken(short);
    const pages = await listManagedPages(longLived.access_token);

    for (const page of pages) {
      await supabase.from("social_connections").upsert(
        {
          provider: "meta",
          platform: "facebook_page",
          external_id: page.id,
          name: page.name,
          page_id: page.id,
          access_token: page.access_token,
          token_expires_at: longLived.expires_at?.toISOString() ?? null,
          scopes: [],
          is_active: true,
          connected_by: user.id,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider,platform,external_id" },
      );

      if (page.instagram_business_account?.id) {
        const ig = await getInstagramProfile(page.instagram_business_account.id, page.access_token);
        await supabase.from("social_connections").upsert(
          {
            provider: "meta",
            platform: "instagram_business",
            external_id: page.instagram_business_account.id,
            name: ig.name || ig.username || "Instagram",
            username: ig.username ?? null,
            avatar_url: ig.profile_picture_url ?? null,
            page_id: page.id,
            access_token: page.access_token,
            token_expires_at: longLived.expires_at?.toISOString() ?? null,
            scopes: [],
            is_active: true,
            connected_by: user.id,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "provider,platform,external_id" },
        );
      }
    }

    return NextResponse.redirect(`${base}/admin/social?connected=1`);
  } catch (e) {
    return fail((e as Error).message || "Connection failed");
  }
}
