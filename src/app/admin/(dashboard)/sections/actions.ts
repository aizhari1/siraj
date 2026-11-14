"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sectionTypes, defaultWorld, type SectionType } from "@/types/content";
import { SECTION_CATALOG, SECTION_SETTINGS } from "@/lib/sections/catalog";
import { emptyFor, validate } from "@/lib/spec/types";

const isType = (t: string): t is SectionType => (sectionTypes as string[]).includes(t);
const refresh = () => revalidatePath("/", "layout");

function defaultsFor(type: SectionType) {
  const def = SECTION_CATALOG[type];
  const settings = emptyFor(SECTION_SETTINGS) as { world: Record<string, unknown> };
  settings.world = { ...defaultWorld, ...def.world };
  return { content: emptyFor(def.fields), settings, label: def.label };
}

async function nextOrder(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"]) {
  const { data } = await supabase.from("sections").select("display_order").order("display_order", { ascending: false }).limit(1).maybeSingle();
  return (data?.display_order ?? 0) + 10;
}

/** New sections start as an unpublished draft, so nothing half-finished reaches visitors. */
async function insertDraftSection(
  ctx: Awaited<ReturnType<typeof requireAdmin>>, type: SectionType, title: string, order: number,
  content?: Record<string, unknown>, settings?: Record<string, unknown>,
) {
  const d = defaultsFor(type);
  const { data, error } = await ctx.supabase.from("sections")
    .insert({ section_type: type, title, content: {}, settings: {}, is_enabled: false, display_order: order })
    .select("id").single();
  if (error || !data) throw new Error(error?.message ?? "Could not create section");
  const { error: e2 } = await ctx.supabase.from("section_drafts")
    .insert({ section_id: data.id, title, content: content ?? d.content, settings: settings ?? d.settings, updated_by: ctx.user.id });
  if (e2) throw new Error(e2.message);
  return data.id as string;
}

export async function createSection(type: string) {
  const ctx = await requireAdmin();
  if (!isType(type)) return;
  const id = await insertDraftSection(ctx, type, SECTION_CATALOG[type].label, await nextOrder(ctx.supabase));
  refresh();
  redirect(`/admin/sections/${id}`);
}

const STARTER: { type: SectionType; title: string }[] = [
  { type: "hero", title: "Hero" },
  { type: "text_image", title: "Introduction" },
  { type: "services_grid", title: "Services" },
  { type: "projects_grid", title: "Featured Projects" },
  { type: "statistics", title: "Why SIRAJ" },
  { type: "process_timeline", title: "Work Process" },
  { type: "custom_content", title: "Industries" },
  { type: "testimonials", title: "Testimonials" },
  { type: "cta", title: "Final CTA" },
];

/** Creates the standard homepage structure with empty copy. Each section keeps its own animated "world". */
export async function createStarterLayout() {
  const ctx = await requireAdmin();
  const { count } = await ctx.supabase.from("sections").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return;
  let order = 10;
  for (const s of STARTER) { await insertDraftSection(ctx, s.type, s.title, order); order += 10; }
  refresh();
  redirect("/admin/sections");
}

export async function reorderSections(ids: string[]) {
  const { supabase } = await requireAdmin();
  await Promise.all(ids.map((id, i) => supabase.from("sections").update({ display_order: (i + 1) * 10 }).eq("id", id)));
  refresh();
}

export async function toggleSection(id: string, enabled: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("sections").update({ is_enabled: enabled }).eq("id", id);
  refresh();
}

export async function duplicateSection(id: string) {
  const ctx = await requireAdmin();
  const { data: src } = await ctx.supabase.from("sections").select("*").eq("id", id).maybeSingle();
  if (!src) return;
  const type = String(src.section_type);
  if (!isType(type)) return;
  const { data: draft } = await ctx.supabase.from("section_drafts").select("*").eq("section_id", id).maybeSingle();
  const useDraft = draft ?? src;
  const newId = await insertDraftSection(ctx, type, `${src.title || SECTION_CATALOG[type].label} (copy)`,
    await nextOrder(ctx.supabase), useDraft.content, useDraft.settings);
  refresh();
  redirect(`/admin/sections/${newId}`);
}

export async function deleteSection(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("sections").delete().eq("id", id);
  refresh();
}

export type SaveState = { ok?: string; error?: string; hasDraft?: boolean } | null;

export async function saveSection(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const { supabase, user } = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const intent = String(fd.get("intent") ?? "draft");

  const { data: sec } = await supabase.from("sections").select("id,section_type,content").eq("id", id).maybeSingle();
  if (!sec) return { error: "Section not found." };
  const secType = String(sec.section_type);
  if (!isType(secType)) return { error: "Unknown section type." };

  if (intent === "discard") {
    await supabase.from("section_drafts").delete().eq("section_id", id);
    refresh();
    return { ok: "Draft discarded. Reload to see the published version.", hasDraft: false };
  }

  let payload: { title?: unknown; content?: unknown; settings?: unknown };
  try { payload = JSON.parse(String(fd.get("payload") ?? "{}")); } catch { return { error: "Couldn't read the form data." }; }

  const content = validate(SECTION_CATALOG[secType].fields, payload.content);
  if (!content.ok) return { error: content.error };
  const settings = validate(SECTION_SETTINGS, payload.settings);
  if (!settings.ok) return { error: settings.error };
  const title = String(payload.title ?? "").trim().slice(0, 160);

  if (intent === "publish") {
    const firstPublish = Object.keys((sec.content as object) ?? {}).length === 0;
    const { error } = await supabase.from("sections")
      .update({ title, content: content.data, settings: settings.data, ...(firstPublish ? { is_enabled: true } : {}) }).eq("id", id);
    if (error) return { error: `Couldn't publish: ${error.message}` };
    await supabase.from("section_drafts").delete().eq("section_id", id);
    refresh();
    return { ok: firstPublish ? "Published and switched on." : "Published.", hasDraft: false };
  }

  const { error } = await supabase.from("section_drafts")
    .upsert({ section_id: id, title, content: content.data, settings: settings.data, updated_by: user.id });
  if (error) return { error: `Couldn't save draft: ${error.message}` };
  revalidatePath("/admin/sections");
  return { ok: "Draft saved. Visitors still see the published version.", hasDraft: true };
}
