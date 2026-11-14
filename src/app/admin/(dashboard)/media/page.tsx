import { requireAdmin } from "@/lib/auth";
import { MediaManager, type MediaItem } from "@/components/admin/media-manager";

export default async function MediaPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("media").select("path,alt_ar,alt_en,mime_type,size_bytes").order("created_at", { ascending: false }).limit(300);
  const items: MediaItem[] = await Promise.all((data ?? []).map(async (m) => {
    const { data: inUse } = await supabase.rpc("media_in_use", { p: m.path });
    return { path: m.path, alt_ar: m.alt_ar ?? "", alt_en: m.alt_en ?? "", mime: m.mime_type ?? "", size: Number(m.size_bytes ?? 0), inUse: Boolean(inUse) };
  }));
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-semibold">Media library</h1>
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error.message}</p>}
      <MediaManager items={items} />
    </div>
  );
}
