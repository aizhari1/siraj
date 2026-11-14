import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Section } from "@/types/content";

export type Row = Record<string, unknown> & { id: string };
export type Result<T> = { data: T; error: boolean };

async function run<T>(fallback: T, fn: () => PromiseLike<{ data: T | null; error: unknown }>): Promise<Result<T>> {
  try {
    const { data, error } = await fn();
    if (error) return { data: fallback, error: true };
    return { data: data ?? fallback, error: false };
  } catch {
    return { data: fallback, error: true };
  }
}

export const getSettings = async (): Promise<Record<string, Record<string, unknown>>> => {
  const { data } = await run<{ key: string; value: Record<string, unknown> }[]>([], () =>
    createPublicClient().from("site_settings").select("key,value"));
  return Object.fromEntries(data.map((r) => [r.key, r.value ?? {}]));
};

export const getSections = () =>
  run<Section[]>([], () => createPublicClient().from("sections").select("*").order("display_order") as unknown as PromiseLike<{ data: Section[] | null; error: unknown }>);

export const getProjects = (opts: { featured?: boolean; limit?: number } = {}) =>
  run<Row[]>([], () => {
    let q = createPublicClient().from("projects").select("*").order("display_order").order("created_at", { ascending: false });
    if (opts.featured) q = q.eq("is_featured", true);
    if (opts.limit) q = q.limit(opts.limit);
    return q as unknown as PromiseLike<{ data: Row[] | null; error: unknown }>;
  });

export const getProject = (slug: string) =>
  run<Row | null>(null, () => createPublicClient().from("projects").select("*").eq("slug", slug).maybeSingle() as unknown as PromiseLike<{ data: Row | null; error: unknown }>);

export const getServices = (limit?: number) =>
  run<Row[]>([], () => {
    let q = createPublicClient().from("services").select("*").order("display_order");
    if (limit) q = q.limit(limit);
    return q as unknown as PromiseLike<{ data: Row[] | null; error: unknown }>;
  });

export const getService = (slug: string) =>
  run<Row | null>(null, () => createPublicClient().from("services").select("*").eq("slug", slug).maybeSingle() as unknown as PromiseLike<{ data: Row | null; error: unknown }>);

export const getTestimonials = (limit?: number) =>
  run<Row[]>([], () => {
    let q = createPublicClient().from("testimonials").select("*").order("display_order");
    if (limit) q = q.limit(limit);
    return q as unknown as PromiseLike<{ data: Row[] | null; error: unknown }>;
  });

// ---- small typed readers for settings ----
const o = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
export const s = (v: unknown) => (typeof v === "string" ? v : "");
export const bi = (v: unknown, locale: "ar" | "en") => {
  const p = o(v);
  return s(p[locale]) || s(p[locale === "ar" ? "en" : "ar"]);
};
export const field = (r: Record<string, unknown>, base: string, locale: "ar" | "en") =>
  s(r[`${base}_${locale}`]) || s(r[`${base}_${locale === "ar" ? "en" : "ar"}`]);
export { o as asObject };
