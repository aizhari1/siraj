"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { publishFacebookPagePost, publishInstagramImage } from "@/lib/social/publish";

export type SocialPostState = { ok?: string; error?: string } | null;

export async function saveSocialPost(_prev: SocialPostState, fd: FormData): Promise<SocialPostState> {
  const { supabase, user } = await requireAdmin();
  const intent = String(fd.get("intent") ?? "draft");
  const connectionId = String(fd.get("connection_id") ?? "");
  const caption = String(fd.get("caption") ?? "").trim();
  const imagePath = String(fd.get("image_path") ?? "").trim() || null;
  const scheduledRaw = String(fd.get("scheduled_at") ?? "").trim();

  if (!connectionId) return { error: "Choose an account." };
  if (!caption && !imagePath) return { error: "Add a caption or an image." };

  const { data: conn } = await supabase
    .from("social_connections")
    .select("id,platform,external_id,page_id,access_token,is_active")
    .eq("id", connectionId)
    .eq("is_active", true)
    .maybeSingle();

  if (!conn) return { error: "Account not found or disconnected." };

  if (conn.platform === "instagram_business" && !imagePath && intent === "publish") {
    return { error: "Instagram posts need an image." };
  }

  let scheduledAt: string | null = null;
  if (scheduledRaw) {
    const d = new Date(scheduledRaw);
    if (Number.isNaN(d.getTime())) return { error: "Invalid schedule time." };
    if (d.getTime() < Date.now() - 60_000) return { error: "Schedule time must be in the future." };
    scheduledAt = d.toISOString();
  }

  if (intent === "schedule" && !scheduledAt) return { error: "Pick a schedule time, or use Publish now." };

  if (intent === "draft" || intent === "schedule") {
    const status = intent === "schedule" ? "scheduled" : "draft";
    const { error } = await supabase.from("social_posts").insert({
      connection_id: connectionId,
      status,
      caption,
      media_paths: imagePath ? [imagePath] : [],
      scheduled_at: scheduledAt,
      created_by: user.id,
    });
    if (error) return { error: error.message };
    revalidatePath("/admin/social");
    return { ok: status === "scheduled" ? "Scheduled." : "Draft saved." };
  }

  // Publish now
  const { data: row, error: insErr } = await supabase
    .from("social_posts")
    .insert({
      connection_id: connectionId,
      status: "publishing",
      caption,
      media_paths: imagePath ? [imagePath] : [],
      created_by: user.id,
    })
    .select("id")
    .single();
  if (insErr || !row) return { error: insErr?.message ?? "Could not create post" };

  try {
    let externalId = "";
    if (conn.platform === "facebook_page") {
      externalId = await publishFacebookPagePost({
        pageId: conn.external_id,
        pageToken: conn.access_token,
        caption,
        imagePath,
      });
    } else if (conn.platform === "instagram_business") {
      externalId = await publishInstagramImage({
        igUserId: conn.external_id,
        pageToken: conn.access_token,
        caption,
        imagePath: imagePath!,
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
      .eq("id", row.id);

    revalidatePath("/admin/social");
    return { ok: "Published." };
  } catch (e) {
    await supabase
      .from("social_posts")
      .update({ status: "failed", error: (e as Error).message })
      .eq("id", row.id);
    revalidatePath("/admin/social");
    return { error: (e as Error).message };
  }
}

export async function deleteSocialPost(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("social_posts").delete().eq("id", id);
  revalidatePath("/admin/social");
}
