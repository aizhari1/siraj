import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SECTION_CATALOG } from "@/lib/sections/catalog";
import type { SectionType } from "@/types/content";
import { btnGhost } from "@/lib/admin/ui";
import { toggleSection } from "../sections/actions";
import { setFlag } from "../actions";

export default async function HomepageEditor() {
  const { supabase } = await requireAdmin();
  const [{ data: secs }, { data: projects }] = await Promise.all([
    supabase.from("sections").select("id,title,section_type,content,is_enabled").order("display_order"),
    supabase.from("projects").select("id,title_en,is_featured,is_published").order("display_order"),
  ]);
  const sections = secs ?? [];
  const hero = sections.find((s) => s.section_type === "hero");
  const intro = sections.find((s) => s.section_type === "text_image");

  const quick = (label: string, s: { id: string } | undefined, type: SectionType) => (
    <div className="rounded-xl border border-white/10 bg-card p-4">
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted">{SECTION_CATALOG[type].description}</p>
      <div className="mt-3">{s
        ? <Link className={btnGhost} href={`/admin/sections/${s.id}`}>Edit {label.toLowerCase()}</Link>
        : <Link className={btnGhost} href="/admin/sections">Create it in Sections</Link>}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <h1 className="text-2xl font-semibold">Homepage</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {quick("Hero", hero, "hero")}
        {quick("Introduction", intro, "text_image")}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium">Featured projects</h2>
        {(projects ?? []).length === 0 ? <p className="text-sm text-muted">No projects yet. Add some in Projects first.</p> : (
          <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-card">
            {(projects ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="truncate">{p.title_en}{!p.is_published && <span className="ms-2 text-xs text-muted">(draft, not shown to visitors)</span>}</span>
                <form action={setFlag.bind(null, "projects", p.id, "is_featured", !p.is_featured)}><button className={btnGhost}>{p.is_featured ? "★ Featured" : "Feature"}</button></form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Section visibility</h2>
        {sections.length === 0 ? <p className="text-sm text-muted">No sections yet. Create the layout in Sections.</p> : (
          <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-card">
            {sections.map((s) => {
              const published = Object.keys(s.content ?? {}).length > 0;
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="truncate">{s.title || SECTION_CATALOG[s.section_type as SectionType]?.label}</span>
                  {published
                    ? <form action={toggleSection.bind(null, s.id, !s.is_enabled)}><button className={btnGhost}>{s.is_enabled ? "Visible · hide" : "Hidden · show"}</button></form>
                    : <span className="text-xs text-muted">Not published yet</span>}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
