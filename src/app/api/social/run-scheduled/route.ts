import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { publishFacebookPagePost, publishInstagramImage } from "@/lib/social/publish";

/**
 * Publishes due scheduled social posts.
 * Protected by CRON_SECRET (Authorization: Bearer …) or Vercel Cron header.
 * Runs every 15 minutes via vercel.json crons.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-vercel-cron");
  const secret = process.env.CRON_SECRET;
  const ok =
    Boolean(cronHeader) ||
    (secret && auth === `Bearer ${secret}`) ||
    (!secret && process.env.NODE_ENV === "development");

  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Missing Supabase service config" }, { status: 500 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const now = new Date().toISOString();

  const { data: due, error } = await supabase
    .from("social_posts")
    .select("id,caption,media_paths,connection_id")
    .eq("status", "scheduled")
    .lte("scheduled_at", now)
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: { id: string; ok?: boolean; error?: string }[] = [];

  for (const post of due ?? []) {
    await supabase.from("social_posts").update({ status: "publishing" }).eq("id", post.id);

    const { data: conn } = await supabase
      .from("social_connections")
      .select("platform,external_id,access_token,is_active")
      .eq("id", post.connection_id)
      .maybeSingle();

    if (!conn || !conn.is_active) {
      await supabase
        .from("social_posts")
        .update({ status: "failed", error: "Account missing or disconnected" })
        .eq("id", post.id);
      results.push({ id: post.id, error: "no connection" });
      continue;
    }

    const imagePath = (post.media_paths as string[] | null)?.[0] ?? null;
    try {
      let externalId = "";
      if (conn.platform === "facebook_page") {
        externalId = await publishFacebookPagePost({
          pageId: conn.external_id,
          pageToken: conn.access_token,
          caption: post.caption ?? "",
          imagePath,
        });
      } else if (conn.platform === "instagram_business") {
        if (!imagePath) throw new Error("Instagram requires an image");
        externalId = await publishInstagramImage({
          igUserId: conn.external_id,
          pageToken: conn.access_token,
          caption: post.caption ?? "",
          imagePath,
        });
      } else {
        throw new Error("Unsupported platform");
      }

      await supabase
        .from("social_posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          external_post_id: externalId,
          error: null,
        })
        .eq("id", post.id);
      results.push({ id: post.id, ok: true });
    } catch (e) {
      await supabase
        .from("social_posts")
        .update({ status: "failed", error: (e as Error).message })
        .eq("id", post.id);
      results.push({ id: post.id, error: (e as Error).message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
