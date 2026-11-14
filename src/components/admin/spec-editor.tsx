"use client";
import { emptyFor, type FieldSpec } from "@/lib/spec/types";
import { btnGhost, inputCls, labelCls } from "@/lib/admin/ui";
import { ImagePicker, VideoPicker } from "./pickers";

type Obj = Record<string, unknown>;
type Pair = { ar: string; en: string };
type MediaRef = { url: string; alt: Pair };
type Btn = { label: Pair; href: string; variant: "primary" | "ghost" };

const asObj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asStr = (v: unknown) => (typeof v === "string" ? v : "");
const pair = (v: unknown): Pair => ({ ar: asStr(asObj(v).ar), en: asStr(asObj(v).en) });

function BiField({ value, onChange, long, id }: { value: unknown; onChange: (v: Pair) => void; long?: boolean; id: string }) {
  const p = pair(value);
  const C = long ? "textarea" : "input";
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <C id={`${id}-ar`} dir="rtl" lang="ar" placeholder="العربية" className={inputCls} {...(long ? { rows: 4 } : {})} value={p.ar} onChange={(e) => onChange({ ...p, ar: e.target.value })} />
      <C id={`${id}-en`} dir="ltr" lang="en" placeholder="English" className={inputCls} {...(long ? { rows: 4 } : {})} value={p.en} onChange={(e) => onChange({ ...p, en: e.target.value })} />
    </div>
  );
}

function MediaField({ value, onChange, folder, id }: { value: unknown; onChange: (v: MediaRef) => void; folder: Parameters<typeof ImagePicker>[0]["folder"]; id: string }) {
  const o = asObj(value);
  const m: MediaRef = { url: asStr(o.url), alt: pair(o.alt) };
  return (
    <div className="space-y-2">
      <ImagePicker value={m.url} onChange={(url) => onChange({ ...m, url })} folder={folder} />
      {m.url && (
        <>
          <p className="text-xs text-muted">Alt text (describes the image for screen readers)</p>
          <BiField id={`${id}-alt`} value={m.alt} onChange={(alt) => onChange({ ...m, alt })} />
        </>
      )}
    </div>
  );
}

function Move({ i, n, set }: { i: number; n: number; set: (d: number) => void }) {
  return (
    <>
      <button type="button" className={btnGhost} disabled={i === 0} aria-label="Move up" onClick={() => set(-1)}>↑</button>
      <button type="button" className={btnGhost} disabled={i === n - 1} aria-label="Move down" onClick={() => set(1)}>↓</button>
    </>
  );
}

function swap<T>(a: T[], i: number, d: number): T[] {
  const b = [...a]; const j = i + d;
  if (j < 0 || j >= b.length) return a;
  [b[i], b[j]] = [b[j], b[i]];
  return b;
}

export function SpecFields({ specs, value, onChange, idPrefix = "f" }: { specs: FieldSpec[]; value: Obj; onChange: (v: Obj) => void; idPrefix?: string }) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });
  return (
    <div className="space-y-5">
      {specs.map((f) => {
        const id = `${idPrefix}-${f.key}`;
        const v = value[f.key];
        const wrap = (body: React.ReactNode) => (
          <div key={f.key}>
            <label htmlFor={`${id}-en`} className={labelCls}>{f.label}</label>
            {body}
            {"help" in f && f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>}
          </div>
        );
        switch (f.kind) {
          case "bi": return wrap(<BiField id={id} value={v} long={f.long} onChange={(x) => set(f.key, x)} />);
          case "text": return wrap(<input id={`${id}-en`} className={inputCls} dir={f.ltr ? "ltr" : undefined} value={asStr(v)} onChange={(e) => set(f.key, e.target.value)} />);
          case "number": return wrap(<input id={`${id}-en`} type="number" className={inputCls} min={f.min ?? 0} max={f.max} step={f.step ?? 1} value={typeof v === "number" ? v : Number(v ?? 0)} onChange={(e) => set(f.key, e.target.value === "" ? 0 : Number(e.target.value))} />);
          case "bool": return (
            <label key={f.key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[#8B5CF6]" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} />{f.label}
            </label>
          );
          case "color": return wrap(
            <div className="flex items-center gap-2">
              <input id={`${id}-en`} type="color" className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-surface" value={asStr(v) || "#8b5cf6"} onChange={(e) => set(f.key, e.target.value)} />
              <code className="text-xs text-muted">{asStr(v)}</code>
            </div>);
          case "select": return wrap(
            <select id={`${id}-en`} className={inputCls} value={asStr(v)} onChange={(e) => set(f.key, e.target.value)}>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>);
          case "image": return wrap(<ImagePicker value={asStr(v)} onChange={(x) => set(f.key, x)} folder={f.folder} />);
          case "video": return wrap(<VideoPicker value={asStr(v)} onChange={(x) => set(f.key, x)} folder={f.folder} />);
          case "media": return wrap(<MediaField id={id} value={v} folder={f.folder} onChange={(x) => set(f.key, x)} />);
          case "medialist": {
            const list = asArr(v) as MediaRef[];
            return wrap(
              <div className="space-y-3">
                {list.map((m, i) => (
                  <div key={i} className="rounded-lg border border-white/10 p-3">
                    <MediaField id={`${id}-${i}`} value={m} folder={f.folder} onChange={(x) => set(f.key, list.map((y, j) => (j === i ? x : y)))} />
                    <div className="mt-2 flex gap-1"><Move i={i} n={list.length} set={(d) => set(f.key, swap(list, i, d))} />
                      <button type="button" className={btnGhost} onClick={() => set(f.key, list.filter((_, j) => j !== i))}>Remove</button></div>
                  </div>
                ))}
                <button type="button" className={btnGhost} onClick={() => set(f.key, [...list, { url: "", alt: { ar: "", en: "" } }])}>Add logo</button>
              </div>);
          }
          case "buttons": {
            const list = asArr(v) as Btn[];
            const upd = (i: number, patch: Partial<Btn>) => set(f.key, list.map((b, j) => (j === i ? { ...b, ...patch } : b)));
            return wrap(
              <div className="space-y-3">
                {list.map((b, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-white/10 p-3">
                    <BiField id={`${id}-${i}`} value={b.label} onChange={(x) => upd(i, { label: x })} />
                    <div className="grid gap-2 md:grid-cols-[1fr_9rem]">
                      <input className={inputCls} dir="ltr" placeholder="/contact or https://…" aria-label="Link" value={b.href ?? ""} onChange={(e) => upd(i, { href: e.target.value })} />
                      <select className={inputCls} aria-label="Style" value={b.variant ?? "primary"} onChange={(e) => upd(i, { variant: e.target.value as Btn["variant"] })}>
                        <option value="primary">Primary</option><option value="ghost">Outline</option>
                      </select>
                    </div>
                    <div className="flex gap-1"><Move i={i} n={list.length} set={(d) => set(f.key, swap(list, i, d))} />
                      <button type="button" className={btnGhost} onClick={() => set(f.key, list.filter((_, j) => j !== i))}>Remove</button></div>
                  </div>
                ))}
                {list.length < 4 && <button type="button" className={btnGhost} onClick={() => set(f.key, [...list, { label: { ar: "", en: "" }, href: "", variant: "primary" }])}>Add button</button>}
              </div>);
          }
          case "group": return (
            <fieldset key={f.key} className="rounded-lg border border-white/10 p-4">
              <legend className="px-2 text-sm text-brand-light">{f.label}</legend>
              <SpecFields specs={f.fields} value={asObj(v)} onChange={(x) => set(f.key, x)} idPrefix={id} />
            </fieldset>);
          case "items": {
            const list = asArr(v).map(asObj);
            return (
              <fieldset key={f.key} className="rounded-lg border border-white/10 p-4">
                <legend className="px-2 text-sm text-brand-light">{f.label}</legend>
                <div className="space-y-4">
                  {list.map((it, i) => (
                    <div key={i} className="rounded-lg bg-surface p-3">
                      <p className="mb-3 text-xs text-muted">{f.itemLabel} {i + 1}</p>
                      <SpecFields specs={f.fields} value={it} idPrefix={`${id}-${i}`} onChange={(x) => set(f.key, list.map((y, j) => (j === i ? x : y)))} />
                      <div className="mt-3 flex gap-1"><Move i={i} n={list.length} set={(d) => set(f.key, swap(list, i, d))} />
                        <button type="button" className={btnGhost} onClick={() => set(f.key, list.filter((_, j) => j !== i))}>Remove</button></div>
                    </div>
                  ))}
                  {list.length < (f.max ?? 24) && <button type="button" className={btnGhost} onClick={() => set(f.key, [...list, emptyFor(f.fields)])}>Add {f.itemLabel.toLowerCase()}</button>}
                </div>
              </fieldset>);
          }
        }
      })}
    </div>
  );
}
