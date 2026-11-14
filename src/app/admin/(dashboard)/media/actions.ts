"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { MEDIA_BUCKET } from "@/lib/media";

export async function saveAlt(path: string, altAr: string, altEn: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("media").update({ alt_ar: altAr.slice(0, 300) || null, alt_en: altEn.slice(0, 300) || null }).eq("path", path);
  revalidatePath("/admin/media");
}

export async function deleteMedia(path: string): Promise<{ error?: string }> {
  const { supabase } = await requireAdmin();
  const { data: inUse } = await supabase.rpc("media_in_use", { p: path });
  if (inUse) return { error: "This file is still used by your content. Remove it there first." };
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) return { error: error.message };
  await supabase.from("media").delete().eq("path", path);
  revalidatePath("/admin/media");
  return {};
}
