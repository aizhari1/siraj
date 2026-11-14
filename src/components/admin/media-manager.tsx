"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { replaceMedia, uploadMedia } from "@/lib/admin/upload";
import { mediaUrl, type MediaFolder } from "@/lib/media";
import { btnDanger, btnGhost, inputCls } from "@/lib/admin/ui";
import { deleteMedia, saveAlt } from "@/app/admin/(dashboard)/media/actions";

export type MediaItem = { path: string; alt_ar: string; alt_en: string; mime: string; size: number; inUse: boolean };
const folders: MediaFolder[] = ["projects", "services", "sections", "branding", "testimonials"];

function Card({ m }: { m: MediaItem }) {
  const router = useRouter();
  const [ar, setAr] = useState(m.alt_ar);
  const [en, setEn] = useState(m.alt_en);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [, start] = useTransition();
  const isVideo = m.mime.startsWith("video/");
  return (
    <li className="flex flex-col rounded-xl border border-white/10 bg-card p-3">
      {isVideo ? <video src={mediaUrl(m.path)} controls className="h-36 w-full rounded-lg bg-black object-cover" />
        : <img src={mediaUrl(m.path)} alt={en || ar} loading="lazy" className="h-36 w-full rounded-lg object-cover" />}
      <p className="mt-2 truncate text-xs text-muted" dir="ltr">{m.path} · {(m.size / 1024).toFixed(0)} KB</p>
      {m.inUse && <span className="mt-1 w-fit rounded-full bg-brand/20 px-2 py-0.5 text-xs text-brand-light">In use</span>}
      {!isVideo && (
        <div className="mt-2 space-y-1.5">
          <input className={inputCls} dir="rtl" placeholder="النص البديل" aria-label="Alt text Arabic" value={ar} onChange={(e) => setAr(e.target.value)} />
          <input className={inputCls} placeholder="Alt text (English)" aria-label="Alt text English" value={en} onChange={(e) => setEn(e.target.value)} />
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {!isVideo && <button className={btnGhost} onClick={() => start(async () => { await saveAlt(m.path, ar, en); setMsg("Saved"); })}>Save alt</button>}
        <label className={`${btnGhost} cursor-pointer`}>{busy ? "Replacing…" : "Replace"}
          <input type="file" hidden accept={isVideo ? "video/mp4,video/webm" : "image/*"} disabled={busy} onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
            setBusy(true); setMsg("");
            try { await replaceMedia(f, m.path, m.mime); setMsg("Replaced. It can take up to an hour to refresh everywhere."); router.refresh(); }
            catch (x) { setMsg((x as Error).message); }
            setBusy(false);
          }} />
        </label>
        <button className={btnDanger} disabled={m.inUse} title={m.inUse ? "Used by content. Remove it there first." : undefined}
          onClick={async () => { if (!confirm("Delete this file permanently?")) return; const r = await deleteMedia(m.path); if (r.error) setMsg(r.error); else router.refresh(); }}>Delete</button>
      </div>
      {msg && <p role="status" className="mt-2 text-xs text-muted">{msg}</p>}
    </li>
  );
}

export function MediaManager({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [folder, setFolder] = useState<MediaFolder>("projects");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-card p-4">
        <select aria-label="Folder" className={`${inputCls} !w-auto`} value={folder} onChange={(e) => setFolder(e.target.value as MediaFolder)}>
          {folders.map((f) => <option key={f}>{f}</option>)}
        </select>
        <label className={`${btnGhost} cursor-pointer`}>{busy ? "Uploading…" : "Upload files"}
          <input type="file" hidden multiple accept="image/*,video/mp4,video/webm" disabled={busy} onChange={async (e) => {
            const files = Array.from(e.target.files ?? []); e.target.value = ""; if (!files.length) return;
            setBusy(true); setErr("");
            for (const f of files) {
              try { await uploadMedia(f, folder, f.type.startsWith("video/") ? "video" : "image"); }
              catch (x) { setErr(`${f.name}: ${(x as Error).message}`); }
            }
            setBusy(false); router.refresh();
          }} />
        </label>
        {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
      </div>
      {items.length === 0
        ? <p className="mt-6 rounded-xl border border-dashed border-white/15 p-10 text-center text-muted">No files yet. Upload your first image or video.</p>
        : <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((m) => <Card key={m.path} m={m} />)}</ul>}
    </div>
  );
}
