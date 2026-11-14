import { requireAdmin } from "@/lib/auth";
import { btnDanger, btnGhost } from "@/lib/admin/ui";
import { deleteInquiry, setInquiryStatus } from "./actions";

export default async function InquiriesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = data ?? [];
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold">Inquiries</h1>
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error.message}</p>}
      {!error && rows.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-10 text-center text-muted">No inquiries yet. They appear here when visitors use the contact form.</p>}
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id} className={`rounded-xl border bg-card p-4 ${r.status === "new" ? "border-brand/50" : "border-white/10"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{r.name}{r.company ? <span className="text-muted"> · {r.company}</span> : null}</p>
              <time className="text-xs text-muted" dateTime={r.created_at}>{new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</time>
            </div>
            <p className="mt-1 text-sm text-muted" dir="ltr">
              <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>
              {r.whatsapp && <> · <a className="underline" href={`https://wa.me/${String(r.whatsapp).replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp {r.whatsapp}</a></>}
              {r.country && <> · {r.country}</>}
            </p>
            <p className="mt-1 text-xs text-muted">{[r.service, r.budget].filter(Boolean).join(" · ")}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm">{r.details}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="me-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">{r.status}</span>
              {(["new", "read", "replied", "archived"] as const).filter((s) => s !== r.status).map((s) => (
                <form key={s} action={setInquiryStatus.bind(null, r.id, s)}><button className={btnGhost}>Mark {s}</button></form>
              ))}
              <form action={deleteInquiry.bind(null, r.id)}><button className={btnDanger}>Delete</button></form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
