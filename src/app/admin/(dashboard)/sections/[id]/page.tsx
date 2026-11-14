import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { SECTION_CATALOG, SECTION_SETTINGS } from "@/lib/sections/catalog";
import { objectFor } from "@/lib/spec/types";
import type { SectionType } from "@/types/content";
import { SectionEditor } from "@/components/admin/section-editor";

export default async function EditSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: sec } = await supabase.from("sections").select("*").eq("id", id).maybeSingle();
  if (!sec || !(sec.section_type in SECTION_CATALOG)) notFound();
  const { data: draft } = await supabase.from("section_drafts").select("*").eq("section_id", id).maybeSingle();

  const def = SECTION_CATALOG[sec.section_type as SectionType];
  const src = draft ?? sec;
  const content = objectFor(def.fields).safeParse(src.content);
  const settings = objectFor(SECTION_SETTINGS).safeParse(src.settings);

  return (
    <div className="mx-auto max-w-3xl">
      <SectionEditor
        id={id} typeLabel={def.label} fields={def.fields} settingsFields={SECTION_SETTINGS} hasDraft={Boolean(draft)}
        initial={{
          title: src.title ?? "",
          content: (content.success ? content.data : objectFor(def.fields).parse({})) as Record<string, unknown>,
          settings: (settings.success ? settings.data : objectFor(SECTION_SETTINGS).parse({})) as Record<string, unknown>,
        }}
      />
    </div>
  );
}
