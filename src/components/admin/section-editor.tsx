"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveSection, type SaveState } from "@/app/admin/(dashboard)/sections/actions";
import type { FieldSpec } from "@/lib/spec/types";
import { btnGhost, btnPrimary, inputCls, labelCls } from "@/lib/admin/ui";
import { SpecFields } from "./spec-editor";

type Obj = Record<string, unknown>;

export function SectionEditor({ id, typeLabel, fields, settingsFields, initial, hasDraft }: {
  id: string; typeLabel: string; fields: FieldSpec[]; settingsFields: FieldSpec[];
  initial: { title: string; content: Obj; settings: Obj }; hasDraft: boolean;
}) {
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState<Obj>(initial.content);
  const [settings, setSettings] = useState<Obj>(initial.settings);
  const [state, action, pending] = useActionState<SaveState, FormData>(saveSection, null);
  const draft = state?.hasDraft ?? hasDraft;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="payload" value={JSON.stringify({ title, content, settings })} />

      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-2 border-b border-white/10 bg-bg/90 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <Link href="/admin/sections" className={btnGhost}>← Sections</Link>
        <span className="me-auto text-sm text-muted">{typeLabel}{draft && <span className="ms-2 text-amber-300">● Unpublished changes</span>}</span>
        <button name="intent" value="draft" disabled={pending} className={btnGhost}>Save draft</button>
        {draft && <button name="intent" value="discard" disabled={pending} className={btnGhost} formNoValidate>Discard draft</button>}
        <button name="intent" value="publish" disabled={pending} className={btnPrimary}>{pending ? "Working…" : "Publish"}</button>
      </div>

      {state?.error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{state.error}</p>}
      {state?.ok && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{state.ok}</p>}

      <section className="rounded-xl border border-white/10 bg-card p-5">
        <label htmlFor="title" className={labelCls}>Internal name</label>
        <input id="title" className={inputCls} value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} />
        <p className="mt-1 text-xs text-muted">Only shown here in the dashboard.</p>
      </section>

      <section className="rounded-xl border border-white/10 bg-card p-5">
        <h2 className="mb-4 text-lg font-medium">Content</h2>
        <SpecFields specs={fields} value={content} onChange={setContent} idPrefix="c" />
      </section>

      <section className="rounded-xl border border-white/10 bg-card p-5">
        <h2 className="mb-4 text-lg font-medium">Look &amp; behavior</h2>
        <SpecFields specs={settingsFields} value={settings} onChange={setSettings} idPrefix="s" />
      </section>
    </form>
  );
}
