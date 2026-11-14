import { requireAdmin } from "@/lib/auth";
import { SETTINGS_CATALOG } from "@/lib/settings/catalog";
import { objectFor } from "@/lib/spec/types";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_settings").select("key,value");
  const stored = new Map((data ?? []).map((r) => [r.key as string, r.value]));

  const initial: Record<string, Record<string, unknown>> = {};
  for (const def of SETTINGS_CATALOG) {
    const schema = objectFor(def.fields);
    const parsed = schema.safeParse(stored.get(def.key) ?? {});
    initial[def.key] = (parsed.success ? parsed.data : schema.parse({})) as Record<string, unknown>;
  }
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">Global settings</h1>
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error.message}</p>}
      <SettingsForm initial={initial} />
    </div>
  );
}
