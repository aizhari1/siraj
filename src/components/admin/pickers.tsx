"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { uploadMedia } from "@/lib/admin/upload";
import { mediaUrl, type MediaFolder } from "@/lib/media";
import { btnGhost, inputCls } from "@/lib/admin/ui";

export function Err({ msg }: { msg: string }) {
  return msg ? <p role="alert" className="mt-1 text-xs text-red-300">{msg}</p> : null;
}

export function ImagePicker({ value, onChange, folder }: { value: string; onChange: (v: string) => void; folder: MediaFolder }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div>
      {value && <img src={mediaUrl(value)} alt="" className="mb-2 h-32 rounded-lg border border-white/10 object-cover" />}
      <div className="flex items-center gap-2">
        <label className={`${btnGhost} cursor-pointer`}>
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input type="file" accept="image/*" hidden disabled={busy} onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true); setErr("");
            try { onChange(await uploadMedia(file, folder, "image")); } catch (x) { setErr((x as Error).message); }
            setBusy(false);
          }} />
        </label>
        {value && <button type="button" className={btnGhost} onClick={() => onChange("")}>Remove</button>}
      </div>
      <Err msg={err} />
    </div>
  );
}

export function VideoPicker({ value, onChange, folder }: { value: string; onChange: (v: string) => void; folder: MediaFolder }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const isFile = value && !/^https?:\/\//i.test(value);
  return (
    <div>
      {isFile && <video src={mediaUrl(value)} controls className="mb-2 h-40 rounded-lg border border-white/10" />}
      <input className={inputCls} dir="ltr" placeholder="https://… (YouTube, Vimeo or a direct file link)" value={isFile ? "" : value} onChange={(e) => onChange(e.target.value)} />
      <div className="mt-2 flex items-center gap-2">
        <label className={`${btnGhost} cursor-pointer`}>
          {busy ? "Uploading…" : "Upload video"}
          <input type="file" accept="video/mp4,video/webm" hidden disabled={busy} onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true); setErr("");
            try { onChange(await uploadMedia(file, folder, "video")); } catch (x) { setErr((x as Error).message); }
            setBusy(false);
          }} />
        </label>
        {value && <button type="button" className={btnGhost} onClick={() => onChange("")}>Clear</button>}
      </div>
      <p className="mt-1 text-xs text-muted">MP4 or WebM up to 50 MB. For longer or heavier videos, paste a YouTube or Vimeo link instead.</p>
      <Err msg={err} />
    </div>
  );
}
