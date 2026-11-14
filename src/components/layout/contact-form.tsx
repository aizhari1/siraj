"use client";
import { useActionState } from "react";
import { submitInquiry, type ContactState } from "@/app/[locale]/contact/actions";

type Labels = Record<"name" | "company" | "country" | "email" | "whatsappNumber" | "service" | "budget" | "details" | "selectOne" | "other" | "send" | "sending" | "sent" | "sendAnother", string>;

const cls = "w-full rounded-[20px] border border-white/10 bg-card px-5 py-3.5 text-base placeholder:text-muted/60 transition focus:border-brand-light focus:outline-none focus:ring-2 focus:ring-brand/40";

export function ContactForm({ locale, labels, services, budgets }: { locale: string; labels: Labels; services: string[]; budgets: readonly string[] }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitInquiry, null);
  const v = state?.values ?? {};
  const e = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <div role="status" className="glass rounded-[40px] p-10 text-center">
        <p className="text-xl font-medium">{labels.sent}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn-m btn-ton mt-6 !h-11">{labels.sendAnother}</button>
      </div>
    );
  }

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">{label}</label>
      <input id={name} name={name} defaultValue={v[name] ?? ""} aria-invalid={Boolean(e[name])} aria-describedby={e[name] ? `${name}-err` : undefined} className={cls} {...props} />
      {e[name] && <p id={`${name}-err`} role="alert" className="mt-1.5 text-sm text-red-300">{e[name]}</p>}
    </div>
  );

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="_locale" value={locale} />
      {/* Honeypot, hidden from people and assistive tech */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", labels.name, { autoComplete: "name", required: true })}
        {field("company", labels.company, { autoComplete: "organization" })}
        {field("country", labels.country, { autoComplete: "country-name" })}
        {field("email", labels.email, { type: "email", autoComplete: "email", dir: "ltr", required: true })}
        {field("whatsapp", labels.whatsappNumber, { type: "tel", autoComplete: "tel", dir: "ltr", placeholder: "+20…" })}
        <div>
          <label htmlFor="service" className="mb-2 block text-sm font-medium">{labels.service}</label>
          <select id="service" name="service" defaultValue={v.service ?? ""} className={cls}>
            <option value="">{labels.selectOne}</option>
            {services.map((s) => <option key={s}>{s}</option>)}
            <option value={labels.other}>{labels.other}</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="budget" className="mb-2 block text-sm font-medium">{labels.budget}</label>
        <select id="budget" name="budget" defaultValue={v.budget ?? ""} className={cls}>
          <option value="">{labels.selectOne}</option>
          {budgets.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="details" className="mb-2 block text-sm font-medium">{labels.details}</label>
        <textarea id="details" name="details" rows={6} defaultValue={v.details ?? ""} required aria-invalid={Boolean(e.details)} aria-describedby={e.details ? "details-err" : undefined} className={cls} />
        {e.details && <p id="details-err" role="alert" className="mt-1.5 text-sm text-red-300">{e.details}</p>}
      </div>
      {state?.error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">{state.error}</p>}
      <button disabled={pending} className="btn-m btn-pri disabled:opacity-60">{pending ? labels.sending : labels.send}</button>
    </form>
  );
}
