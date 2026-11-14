import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isResourceKey, resources } from "@/lib/admin/resources";
import { btnGhost, btnPrimary } from "@/lib/admin/ui";
import { ConfirmDelete } from "@/components/admin/row-actions";
import { deleteRecord, moveRecord, setFlag } from "../actions";

export default async function ListPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource: key } = await params;
  if (!isResourceKey(key)) notFound();
  const res = resources[key];
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase.from(res.table).select("*").order("display_order").order("created_at", { ascending: false });
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{res.label}</h1>
        <Link href={`/admin/${key}/new`} className={btnPrimary}>New {res.singular}</Link>
      </div>

      {error && <p role="alert" className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">Couldn&apos;t load {res.label.toLowerCase()}: {error.message}</p>}

      {!error && rows.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-muted">No {res.label.toLowerCase()} yet.</p>
          <Link href={`/admin/${key}/new`} className={`${btnPrimary} mt-4`}>Add the first {res.singular}</Link>
        </div>
      )}

      {rows.length > 0 && (
        <ul className="mt-6 divide-y divide-white/5 rounded-xl border border-white/10 bg-card">
          {rows.map((r, i) => {
            const id = String(r.id);
            const published = Boolean(r[res.publishedField]);
            const featured = res.featuredField ? Boolean(r[res.featuredField]) : false;
            return (
              <li key={id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/${key}/${id}`} className="block truncate font-medium hover:text-brand-light">{String(r[res.titleField] ?? "(untitled)")}</Link>
                  <p className="truncate text-xs text-muted">{String(r[res.subtitleField] ?? "")}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${published ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-muted"}`}>{published ? "Published" : "Draft"}</span>
                {res.featuredField && featured && <span className="rounded-full bg-brand/20 px-2 py-0.5 text-xs text-brand-light">Featured</span>}
                <div className="flex flex-wrap items-center gap-1.5">
                  <form action={moveRecord.bind(null, key, id, "up")}><button className={btnGhost} disabled={i === 0} aria-label="Move up">↑</button></form>
                  <form action={moveRecord.bind(null, key, id, "down")}><button className={btnGhost} disabled={i === rows.length - 1} aria-label="Move down">↓</button></form>
                  <form action={setFlag.bind(null, key, id, res.publishedField, !published)}><button className={btnGhost}>{published ? "Unpublish" : "Publish"}</button></form>
                  {res.featuredField && <form action={setFlag.bind(null, key, id, res.featuredField, !featured)}><button className={btnGhost}>{featured ? "Unfeature" : "Feature"}</button></form>}
                  <Link href={`/admin/${key}/${id}`} className={btnGhost}>Edit</Link>
                  <ConfirmDelete name={String(r[res.titleField] ?? res.singular)} action={deleteRecord.bind(null, key, id)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
