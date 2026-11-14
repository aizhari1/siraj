"use client";
import Link from "next/link";
import { useActionState } from "react";
import { saveRecord, type FormState } from "@/app/admin/(dashboard)/actions";
import type { Field, Resource } from "@/lib/admin/resources";
import { slugify } from "@/lib/media";
import { btnGhost, btnPrimary, inputCls, labelCls } from "@/lib/admin/ui";
import { BiListField, GalleryField, ImageField, VideoField } from "./media-fields";

type Values = Record<string, unknown>;

export function RecordForm({ resource, id, initial }: { resource: Resource; id?: string; initial: Values }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveRecord, null);
  const v: Values = state?.values ?? initial;
  const errs = state?.fieldErrors ?? {};
  const groups = [...new Set(resource.fields.map((f) => f.group))];

  const control = (f: Field) => {
    const val = v[f.name];
    const common = { id: f.name, name: f.name, dir: f.rtl ? "rtl" : undefined, className: inputCls };
    switch (f.type) {
      case "textarea":
        return <textarea {...common} rows={4} defaultValue={(val as string) ?? ""} />;
      case "number":
        return <input {...common} type="number" step={1} defaultValue={(val as number) ?? 0} />;
      case "boolean":
        return (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={f.name} defaultChecked={Boolean(val)} className="size-4 accent-[#8B5CF6]" />
            {f.label}
          </label>
        );
      case "image":
        return <ImageField name={f.name} folder={resource.folder} defaultValue={val as string | null} />;
      case "gallery":
        return <GalleryField name={f.name} folder={resource.folder} defaultValue={val as string[]} />;
      case "video":
        return <VideoField name={f.name} folder={resource.folder} defaultValue={val as string | null} />;
      case "bilist":
        return <BiListField name={f.name} defaultValue={val as { ar: string; en: string }[]} />;
      case "select":
        return (
          <select id={f.name} name={f.name} className={inputCls} defaultValue={(val as string) ?? ""}>
            <option value="">None</option>
            {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case "url":
        return <input {...common} type="url" dir="ltr" placeholder="https://" defaultValue={(val as string) ?? ""} />;
      case "slug":
        return <input {...common} dir="ltr" defaultValue={(val as string) ?? ""} />;
      default:
        return <input {...common} type="text" defaultValue={(val as string) ?? ""} />;
    }
  };

  return (
    <form
      action={action}
      className="space-y-8"
      onBlurCapture={(e) => {
        const t = e.target as unknown as HTMLInputElement;
        const slugField = resource.fields.find((f) => f.type === "slug");
        if (!slugField || slugField.slugFrom !== t.name) return;
        const slugInput = e.currentTarget.elements.namedItem(slugField.name) as unknown as HTMLInputElement | null;
        if (slugInput && !slugInput.value) slugInput.value = slugify(t.value);
      }}
    >
      <input type="hidden" name="_resource" value={resource.key} />
      <input type="hidden" name="_id" value={id ?? ""} />

      {state?.error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{state.error}</p>
      )}

      {groups.map((g) => (
        <fieldset key={g} className="rounded-xl border border-white/10 bg-card p-5">
          <legend className="px-2 text-sm font-medium text-brand-light">{g}</legend>
          <div className="grid gap-4 md:grid-cols-2">
            {resource.fields.filter((f) => f.group === g).map((f) => {
              const wide = ["textarea", "image", "gallery", "video", "bilist"].includes(f.type);
              return (
                <div key={f.name} className={wide ? "md:col-span-2" : ""}>
                  {f.type !== "boolean" && <label htmlFor={f.name} className={labelCls}>{f.label}{f.required && <span className="text-brand-light"> *</span>}</label>}
                  {control(f)}
                  {f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>}
                  {errs[f.name] && <p role="alert" className="mt-1 text-xs text-red-300">{errs[f.name]}</p>}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "Saving…" : id ? "Save changes" : `Create ${resource.singular}`}</button>
        <Link href={`/admin/${resource.key}`} className={btnGhost}>Cancel</Link>
      </div>
    </form>
  );
}
