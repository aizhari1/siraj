import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

type Recent = { kind: string; title: string; at: string; href: string };

export default async function Overview() {
  const { supabase } = await requireAdmin();
  const count = async (table: string, filter?: [string, boolean]) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count: n } = await q;
    return n ?? 0;
  };

  const [projects, published, services, sections, newInquiries] = await Promise.all([
    count("projects"), count("projects", ["is_published", true]), count("services"), count("sections"), (async () => {
      const { count: n } = await supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new");
      return n ?? 0;
    })(),
  ]);

  const [p, s, sec] = await Promise.all([
    supabase.from("projects").select("id,title_en,updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("services").select("id,title_en,updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("sections").select("id,title,section_type,updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);
  const recent: Recent[] = [
    ...(p.data ?? []).map((r) => ({ kind: "Project", title: r.title_en, at: r.updated_at, href: `/admin/projects/${r.id}` })),
    ...(s.data ?? []).map((r) => ({ kind: "Service", title: r.title_en, at: r.updated_at, href: `/admin/services/${r.id}` })),
    ...(sec.data ?? []).map((r) => ({ kind: "Section", title: r.title || r.section_type, at: r.updated_at, href: `/admin/sections/${r.id}` })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 8);

  const stats = [
    ["Total projects", projects], ["Published projects", published], ["Total services", services],
    ["Total sections", sections], ["New inquiries", newInquiries],
  ] as const;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-card p-4">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mb-3 mt-10 text-lg font-medium">Recent updates</h2>
      {recent.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-muted">
          Nothing yet. <Link href="/admin/projects/new" className="text-brand-light underline">Add your first project</Link>.
        </p>
      ) : (
        <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-card">
          {recent.map((r) => (
            <li key={r.kind + r.href + r.at}>
              <Link href={r.href} className="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-white/5">
                <span className="truncate"><span className="me-2 text-muted">{r.kind}</span>{r.title}</span>
                <time className="shrink-0 text-xs text-muted" dateTime={r.at}>{new Date(r.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
