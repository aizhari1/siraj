import "server-only";
import { mediaUrl } from "@/lib/media";

const GRAPH = "https://graph.facebook.com/v21.0";

async function graphPost(path: string, body: Record<string, string>) {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  const data = (await res.json()) as { id?: string; error?: { message: string } };
  if (data.error) throw new Error(data.error.message);
  return data;
}

/** Publish a text (optional image) post to a Facebook Page. */
export async function publishFacebookPagePost(opts: {
  pageId: string;
  pageToken: string;
  caption: string;
  imagePath?: string | null;
}) {
  const { pageId, pageToken, caption, imagePath } = opts;
  const url = imagePath ? mediaUrl(imagePath) : "";
  if (url) {
    const data = await graphPost(`${pageId}/photos`, {
      url,
      caption: caption.slice(0, 2000),
      access_token: pageToken,
    });
    return data.id ?? "";
  }
  const data = await graphPost(`${pageId}/feed`, {
    message: caption.slice(0, 5000),
    access_token: pageToken,
  });
  return data.id ?? "";
}

/**
 * Instagram content publishing (image required by IG).
 * 1) create media container 2) publish container
 */
export async function publishInstagramImage(opts: {
  igUserId: string;
  pageToken: string;
  caption: string;
  imagePath: string;
}) {
  const imageUrl = mediaUrl(opts.imagePath);
  if (!imageUrl) throw new Error("Instagram requires an image");

  const create = await graphPost(`${opts.igUserId}/media`, {
    image_url: imageUrl,
    caption: opts.caption.slice(0, 2200),
    access_token: opts.pageToken,
  });
  if (!create.id) throw new Error("Could not create Instagram media container");

  // Brief wait helps IG finish processing the container
  await new Promise((r) => setTimeout(r, 2000));

  const published = await graphPost(`${opts.igUserId}/media_publish`, {
    creation_id: create.id,
    access_token: opts.pageToken,
  });
  return published.id ?? create.id;
}
