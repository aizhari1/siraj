"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { uploadMedia } from "@/lib/admin/upload";
import { mediaUrl, type MediaFolder } from "@/lib/media";
import { btnGhost, inputCls } from "@/lib/admin/ui";

import { Err, ImagePicker, VideoPicker } from "./pickers";
export function ImageField({ name, folder, defaultValue }: { name: string; folder: MediaFolder; defaultValue?: string | null }) {
  const [path, setPath] = useState(defaultValue ?? "");
  return (
    <>
      <input type="hidden" name={name} value={path} />
      <ImagePicker value={path} onChange={setPath} folder={folder} />
    </>
  );
}

export function GalleryField({ name, folder, defaultValue }: { name: string; folder: MediaFolder; defaultValue?: string[] }) {
  const [items, setItems] = useState<string[]>(defaultValue ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const move = (i: number, d: number) => setItems((a) => {
    const b = [...a]; const j = i + d;
    if (j < 0 || j >= b.length) return a;
    [b[i], b[j]] = [b[j], b[i]];
    return b;
  });
  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.length > 0 && (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((p, i) => (
            <li key={p} className="rounded-lg border border-white/10 p-2">
              <img src={mediaUrl(p)} alt="" className="h-24 w-full rounded object-cover" />
              <div className="mt-2 flex gap-1">
                <button type="button" className={btnGhost} aria-label="Move earlier" onClick={() => move(i, -1)}>↑</button>
                <button type="button" className={btnGhost} aria-label="Move later" onClick={() => move(i, 1)}>↓</button>
                <button type="button" className={btnGhost} onClick={() => setItems((a) => a.filter((x) => x !== p))}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <label className={`${btnGhost} cursor-pointer`}>
        {busy ? "Uploading…" : "Add images"}
        <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          setBusy(true); setErr("");
          for (const f of files) {
            try { const p = await uploadMedia(f, folder, "image"); setItems((a) => [...a, p]); }
            catch (x) { setErr(`${f.name}: ${(x as Error).message}`); }
          }
          setBusy(false);
        }} />
      </label>
      <Err msg={err} />
    </div>
  );
}

export function VideoField({ name, folder, defaultValue }: { name: string; folder: MediaFolder; defaultValue?: string | null }) {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <VideoPicker value={value} onChange={setValue} folder={folder} />
    </>
  );
}

type Pair = { ar: string; en: string };
export function BiListField({ name, defaultValue }: { name: string; defaultValue?: Pair[] }) {
  const [items, setItems] = useState<Pair[]>(defaultValue ?? []);
  const set = (i: number, k: keyof Pair, v: string) => setItems((a) => a.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input className={inputCls} dir="rtl" placeholder="العربية" value={it.ar} onChange={(e) => set(i, "ar", e.target.value)} />
          <input className={inputCls} placeholder="English" value={it.en} onChange={(e) => set(i, "en", e.target.value)} />
          <button type="button" className={btnGhost} aria-label="Remove item" onClick={() => setItems((a) => a.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className={btnGhost} onClick={() => setItems((a) => [...a, { ar: "", en: "" }])}>Add item</button>
    </div>
  );
}
