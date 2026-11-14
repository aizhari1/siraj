import { requireAdmin } from "@/lib/auth";
import { SECTION_CATALOG } from "@/lib/sections/catalog";
import { sectionTypes, type SectionType } from "@/types/content";
import { SectionList, type SectionRow } from "@/components/admin/section-list";
import { btnGhost, btnPrimary } from "@/lib/admin/ui";
import { createSection, createStarterLayout } from "./actions";

export default async function SectionsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: secs, error }, { data: drafts }] = await Promise.all([
    supabase.from("sections").select("id,title,section_type,content,is_enabled").order("display_order").order("created_at"),
    supabase.from("section_drafts").select("section_id"),
  ]);
  const draftIds = new Set((drafts ?? []).map((d) => d.section_id));
  const rows: SectionRow[] = (secs ?? []).map((s) => ({
    id: s.id, title: s.title, typeLabel: SECTION_CATALOG[s.section_type as SectionType]?.label ?? s.section_type,
    enabled: s.is_enabled, published: Object.keys(s.content ?? {}).length > 0, hasDraft: draftIds.has(s.id),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Homepage sections</h1>
      <p className="mt-1 text-sm text-muted">Drag to reorder. Edits are saved as drafts until you publish them.</p>

      {error && <p role="alert" className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error.message}</p>}

      {rows.length === 0 && !error ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-muted">No sections yet.</p>
          <form action={createStarterLayout} className="mt-4"><button className={btnPrimary}>Create the standard homepage layout</button></form>
          <p className="mt-2 text-xs text-muted">Hero, Introduction, Services, Projects, Why SIRAJ, Process, Industries, Testimonials and CTA, all empty and ready to fill.</p>
        </div>
      ) : (
        <div className="mt-6"><SectionList initial={rows} /></div>
      )}

      <h2 className="mb-3 mt-10 text-lg font-medium">Add a section</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sectionTypes.map((t) => (
          <li key={t} className="flex flex-col justify-between rounded-xl border border-white/10 bg-card p-4">
            <div><p className="font-medium">{SECTION_CATALOG[t].label}</p><p className="mt-1 text-xs text-muted">{SECTION_CATALOG[t].description}</p></div>
            <form action={createSection.bind(null, t)} className="mt-3"><button className={btnGhost}>Add</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
