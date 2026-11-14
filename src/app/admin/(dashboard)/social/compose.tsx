"use client";

import { useActionState, useState } from "react";
import { saveSocialPost, type SocialPostState } from "./post-actions";
import { btnGhost, btnPrimary, inputCls, labelCls } from "@/lib/admin/ui";
import { uploadMedia } from "@/lib/admin/upload";
import { mediaUrl } from "@/lib/media";

export type ConnOption = { id: string; platform: string; name: string; username: string | null };

export function ComposeForm({ connections }: { connections: ConnOption[] }) {
  const [caption, setCaption] = useState("");
  const [connectionId, setConnectionId] = useState(connections[0]?.id ?? "");
  const [imagePath, setImagePath] = useState("");
  const [busy, setBusy] = useState(false);
  const [upErr, setUpErr] = useState("");
  const [state, action, pending] = useActionState<SocialPostState, FormData>(saveSocialPost, null);

  const selected = connections.find((c) => c.id === connectionId);
  const isIg = selected?.platform === "instagram_business";

  if (connections.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-muted">
        Connect a Facebook page or Instagram account first.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border border-white/10 bg-card p-5">
      <h2 className="text-lg font-medium">New post</h2>
      <input type="hidden" name="image_path" value={imagePath} />

      <div>
        <label htmlFor="connection_id" className={labelCls}>
          Account
        </label>
        <select
          id="connection_id"
          name="connection_id"
          className={inputCls}
          value={connectionId}
          onChange={(e) => setConnectionId(e.target.value)}
        >
          {connections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.platform === "instagram_business" ? "IG" : "FB"} · {c.name}
              {c.username ? ` @${c.username}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="caption" className={labelCls}>
          Caption
        </label>
        <textarea
          id="caption"
          name="caption"
          rows={5}
          className={inputCls}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={isIg ? "Instagram caption…" : "Facebook post…"}
        />
      </div>

      <div>
        <p className={labelCls}>Image {isIg && <span className="text-brand-light">(required for Instagram)</span>}</p>
        {imagePath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(imagePath)} alt="" className="mb-2 h-32 rounded-lg border border-white/10 object-cover" />
        )}
        <div className="flex flex-wrap gap-2">
          <label className={`${btnGhost} cursor-pointer`}>
            {busy ? "Uploading…" : imagePath ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                setUpErr("");
                try {
                  // reuse branding folder path prefix until social folder is in storage policies
                  const path = await uploadMedia(file, "branding", "image");
                  setImagePath(path);
                } catch (x) {
                  setUpErr((x as Error).message);
                }
                setBusy(false);
              }}
            />
          </label>
          {imagePath && (
            <button type="button" className={btnGhost} onClick={() => setImagePath("")}>
              Remove
            </button>
          )}
        </div>
        {upErr && <p className="mt-1 text-xs text-red-300">{upErr}</p>}
      </div>

      <div>
        <label htmlFor="scheduled_at" className={labelCls}>
          Schedule (optional)
        </label>
        <input id="scheduled_at" name="scheduled_at" type="datetime-local" className={inputCls} dir="ltr" />
        <p className="mt-1 text-xs text-muted">Leave empty to publish immediately when you click Publish now.</p>
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {state.ok}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button name="intent" value="draft" disabled={pending} className={btnGhost}>
          Save draft
        </button>
        <button name="intent" value="schedule" disabled={pending} className={btnGhost}>
          Schedule
        </button>
        <button name="intent" value="publish" disabled={pending} className={btnPrimary}>
          {pending ? "Working…" : "Publish now"}
        </button>
      </div>
    </form>
  );
}
