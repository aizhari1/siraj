"use client";
import { useActionState, useState } from "react";
import { saveSettings, type SettingsState } from "@/app/admin/(dashboard)/settings/actions";
import { SETTINGS_CATALOG } from "@/lib/settings/catalog";
import { btnPrimary } from "@/lib/admin/ui";
import { SpecFields } from "./spec-editor";

type Obj = Record<string, unknown>;

export function SettingsForm({ initial }: { initial: Record<string, Obj> }) {
  const [values, setValues] = useState(initial);
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, null);
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="payload" value={JSON.stringify(values)} />
      {SETTINGS_CATALOG.map((def) => (
        <section key={def.key} className="rounded-xl border border-white/10 bg-card p-5">
          <h2 className="mb-4 text-lg font-medium">{def.title}</h2>
          <SpecFields specs={def.fields} value={values[def.key] ?? {}} idPrefix={def.key.replace(".", "-")}
            onChange={(v) => setValues((s) => ({ ...s, [def.key]: v }))} />
        </section>
      ))}
      {state?.error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{state.error}</p>}
      {state?.ok && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{state.ok}</p>}
      <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Save settings"}</button>
    </form>
  );
}
