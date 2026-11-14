"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { isResourceKey, resources, type Field, type Resource } from "@/lib/admin/resources";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, unknown>;
} | null;

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function jsonArray(s: string): unknown[] {
  try {
    const v = JSON.parse(s || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function parseField(f: Field, fd: FormData): unknown {
  const raw = fd.get(f.name);
  const s = typeof raw === "string" ? raw.trim() : "";
  switch (f.type) {
    case "boolean":
      return raw === "on" || raw === "true";
    case "number": {
      const n = Number(s || 0);
      return Number.isFinite(n) ? Math.trunc(n) : 0;
    }
    case "gallery":
      return jsonArray(s).filter((x): x is string => typeof x === "string" && x.length > 0);
    case "bilist":
      return jsonArray(s)
        .filter((x): x is { ar?: unknown; en?: unknown } => typeof x === "object" && x !== null)
        .map((x) => ({ ar: String(x.ar ?? "").trim(), en: String(x.en ?? "").trim() }))
        .filter((x) => x.ar || x.en);
    default:
      return s === "" ? (f.nullable ? null : "") : s;
  }
}

function resourceFor(fd: FormData): Resource {
  const key = String(fd.get("_resource") ?? "");
  if (!isResourceKey(key)) throw new Error("Unknown resource");
  return resources[key];
}

export async function saveRecord(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const res = resourceFor(fd);
  const id = String(fd.get("_id") ?? "");

  const values: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};
  for (const f of res.fields) {
    const v = parseField(f, fd);
    values[f.name] = v;
    if (f.required && (v === "" || v === null)) fieldErrors[f.name] = `${f.label} is required.`;
    if (f.type === "slug" && typeof v === "string" && v && !SLUG_RE.test(v)) {
      fieldErrors[f.name] = "Use lowercase letters, numbers and single hyphens.";
    }
    if (f.type === "url" && typeof v === "string" && v && !/^https?:\/\//i.test(v)) {
      fieldErrors[f.name] = "Start the link with http:// or https://.";
    }
  }
  if (res.key === "testimonials" && !values.content_ar && !values.content_en) {
    fieldErrors.content_en = "Write the testimonial in at least one language.";
  }
  if (Object.keys(fieldErrors).length) {
    return { error: "Fix the highlighted fields.", fieldErrors, values };
  }

  if (!id && values.display_order === 0) {
    const { data: last } = await supabase
      .from(res.table).select("display_order").order("display_order", { ascending: false }).limit(1).maybeSingle();
    values.display_order = (last?.display_order ?? 0) + 10;
  }

  const { error } = id
    ? await supabase.from(res.table).update(values).eq("id", id)
    : await supabase.from(res.table).insert(values);

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already used by another record.", fieldErrors: { slug: "Already in use." }, values };
    }
    if (error.code === "42501") return { error: "You don't have permission to do that.", values };
    return { error: `Couldn't save: ${error.message}`, values };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/${res.key}`);
}

export async function setFlag(key: string, id: string, field: string, value: boolean) {
  const { supabase } = await requireAdmin();
  if (!isResourceKey(key)) return;
  const res = resources[key];
  if (field !== res.publishedField && field !== res.featuredField) return;
  await supabase.from(res.table).update({ [field]: value }).eq("id", id);
  revalidatePath("/", "layout");
}

export async function deleteRecord(key: string, id: string) {
  const { supabase } = await requireAdmin();
  if (!isResourceKey(key)) return;
  await supabase.from(resources[key].table).delete().eq("id", id);
  revalidatePath("/", "layout");
}

export async function moveRecord(key: string, id: string, dir: "up" | "down") {
  const { supabase } = await requireAdmin();
  if (!isResourceKey(key)) return;
  const table = resources[key].table;
  const { data } = await supabase.from(table).select("id,display_order").order("display_order").order("created_at");
  const rows = data ?? [];
  const i = rows.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  await Promise.all(
    rows.map((r, idx) => (r.display_order === (idx + 1) * 10 ? null : supabase.from(table).update({ display_order: (idx + 1) * 10 }).eq("id", r.id))),
  );
  revalidatePath("/", "layout");
}
