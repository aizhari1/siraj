import { z } from "zod";
import type { MediaFolder } from "@/lib/media";

/** A tiny declarative schema that drives BOTH the admin editor UI and server-side validation. */
export type FieldSpec =
  | { kind: "bi"; key: string; label: string; long?: boolean }
  | { kind: "text"; key: string; label: string; help?: string; ltr?: boolean }
  | { kind: "number"; key: string; label: string; min?: number; max?: number; step?: number; default?: number }
  | { kind: "bool"; key: string; label: string; default?: boolean }
  | { kind: "color"; key: string; label: string; default?: string }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[] }
  | { kind: "image"; key: string; label: string; folder: MediaFolder }
  | { kind: "media"; key: string; label: string; folder: MediaFolder }
  | { kind: "video"; key: string; label: string; folder: MediaFolder }
  | { kind: "buttons"; key: string; label: string }
  | { kind: "medialist"; key: string; label: string; folder: MediaFolder }
  | { kind: "group"; key: string; label: string; fields: FieldSpec[] }
  | { kind: "items"; key: string; label: string; itemLabel: string; max?: number; fields: FieldSpec[] };

const SAFE_HREF = /^(\/|#|https?:\/\/|mailto:|tel:)/i;
const str = (max: number) => z.string().max(max).default("");
const bi = () => z.object({ ar: str(8000), en: str(8000) }).default({ ar: "", en: "" });
const mediaRef = () => z.object({ url: str(600), alt: bi() }).default({ url: "", alt: { ar: "", en: "" } });

function node(f: FieldSpec): z.ZodType {
  switch (f.kind) {
    case "bi": return bi();
    case "text": return str(2000);
    case "number": return z.coerce.number().min(f.min ?? 0).max(f.max ?? 1000).default(f.default ?? f.min ?? 0);
    case "bool": return z.boolean().default(f.default ?? false);
    case "color": return z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a #RRGGBB color").default(f.default ?? "#8B5CF6");
    case "select": return z.enum(f.options.map((o) => o.value) as [string, ...string[]]).default(f.options[0].value);
    case "image": case "video": return str(600);
    case "media": return mediaRef();
    case "medialist": return z.array(mediaRef()).max(40).default([]);
    case "buttons":
      return z.array(z.object({
        label: bi(),
        href: z.string().max(500).refine((v) => v === "" || SAFE_HREF.test(v), "Links must start with /, #, https://, mailto: or tel:").default(""),
        variant: z.enum(["primary", "ghost"]).default("primary"),
      })).max(4).default([]);
    case "group": return objectFor(f.fields).default(objectFor(f.fields).parse({}));
    case "items": return z.array(objectFor(f.fields)).max(f.max ?? 24).default([]);
  }
}

export function objectFor(fields: FieldSpec[]) {
  return z.object(Object.fromEntries(fields.map((f) => [f.key, node(f)])));
}

export function emptyFor(fields: FieldSpec[]): Record<string, unknown> {
  return objectFor(fields).parse({}) as Record<string, unknown>;
}

export function validate(fields: FieldSpec[], input: unknown): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const r = objectFor(fields).safeParse(input ?? {});
  if (r.success) return { ok: true, data: r.data as Record<string, unknown> };
  const i = r.error.issues[0];
  return { ok: false, error: `${i.path.join(" › ") || "Form"}: ${i.message}` };
}
