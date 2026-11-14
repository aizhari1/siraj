"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { SETTINGS_CATALOG } from "@/lib/settings/catalog";
import { validate } from "@/lib/spec/types";

export type SettingsState = { ok?: string; error?: string } | null;

export async function saveSettings(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  const { supabase } = await requireAdmin();
  let payload: Record<string, unknown>;
  try { payload = JSON.parse(String(fd.get("payload") ?? "{}")); } catch { return { error: "Couldn't read the form data." }; }

  const rows: { key: string; value: Record<string, unknown>; is_public: boolean }[] = [];
  for (const def of SETTINGS_CATALOG) {
    const r = validate(def.fields, payload[def.key]);
    if (!r.ok) return { error: `${def.title}: ${r.error}` };
    rows.push({ key: def.key, value: r.data, is_public: true });
  }
  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) return { error: `Couldn't save: ${error.message}` };
  revalidatePath("/", "layout");
  return { ok: "Settings saved." };
}
