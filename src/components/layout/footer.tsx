import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { asObject, bi, s } from "@/lib/data";

export function Footer({ locale, settings }: { locale: Locale; settings: Record<string, Record<string, unknown>> }) {
  const ui = t(locale);
  const f = asObject(settings["footer.content"]);
  const email = s(asObject(settings["contact.email"]).value), phone = s(asObject(settings["contact.phone"]).value);
  const address = bi(asObject(settings["contact.address"]).address, locale);
  const social = Object.entries(asObject(settings["social.links"])).filter(([, v]) => s(v));
  const about = bi(f.about, locale), copy = bi(f.copyright, locale);
  return (
    <footer className="has-bn rounded-t-[40px] border-t border-white/10 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xl font-semibold">SIRAJ <span className="text-brand-light">سِراج</span></p>
          {about && <p className="mt-4 max-w-sm text-muted">{about}</p>}
        </div>
        <nav aria-label="Footer">
          <ul className="space-y-3 text-muted">
            {[["", ui.home], ["/about", ui.about], ["/services", ui.services], ["/portfolio", ui.portfolio], ["/contact", ui.contact], ["/privacy", ui.privacy]].map(([h, l]) => (
              <li key={h}><Link href={`/${locale}${h}`} className="hover:text-white">{l}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="space-y-3 text-muted">
          {email && <p className="flex items-center gap-2"><Mail className="size-4" aria-hidden /><a href={`mailto:${email}`} className="hover:text-white" dir="ltr">{email}</a></p>}
          {phone && <p className="flex items-center gap-2"><Phone className="size-4" aria-hidden /><a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-white" dir="ltr">{phone}</a></p>}
          {address && <p className="flex items-start gap-2"><MapPin className="mt-1 size-4 shrink-0" aria-hidden />{address}</p>}
          {social.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
              {social.map(([k, v]) => <li key={k}><a href={s(v)} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-white">{k}</a></li>)}
            </ul>
          )}
        </div>
      </div>
      {copy && <p className="border-t border-white/5 px-5 py-5 text-center text-sm text-muted">{copy}</p>}
    </footer>
  );
}
