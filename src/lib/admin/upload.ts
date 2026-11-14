"use client";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, type MediaFolder } from "@/lib/media";

const IMAGE = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"];
const VIDEO = ["video/mp4", "video/webm"];
const MAX = 50 * 1024 * 1024;

/** Uploads straight to Storage with the admin's session (RLS enforces admin-only), then records it in the media library. */
export async function uploadMedia(file: File, folder: MediaFolder, kind: "image" | "video"): Promise<string> {
  const allowed = kind === "image" ? IMAGE : VIDEO;
  if (!allowed.includes(file.type)) {
    throw new Error(kind === "image" ? "Use PNG, JPG, WebP, AVIF or GIF." : "Use an MP4 or WebM video.");
  }
  if (file.size > MAX) throw new Error("File is larger than 50 MB.");

  const supabase = createClient();
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
  if (error) throw new Error(error.message);

  await supabase.from("media").insert({ path, mime_type: file.type, size_bytes: file.size });
  return path;
}

/** Replaces a file in place (same path) so every reference to it updates. The new file must be the same type. */
export async function replaceMedia(file: File, path: string, currentMime: string | null): Promise<void> {
  if (currentMime && file.type !== currentMime) throw new Error(`The replacement must also be ${currentMime}.`);
  if (file.size > MAX) throw new Error("File is larger than 50 MB.");
  const supabase = createClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).update(path, file, { contentType: file.type, cacheControl: "3600", upsert: true });
  if (error) throw new Error(error.message);
  await supabase.from("media").update({ mime_type: file.type, size_bytes: file.size }).eq("path", path);
}
