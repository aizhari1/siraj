import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { asObject, bi, field, getServices, getSettings, s } from "@/lib/data";
import { PageHead } from "@/components/layout/page-head";
import { ContactForm } from "@/components/layout/contact-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).contact, alternates: { languages: { ar: "/ar/contact", en: "/en/contact" } } } : {};
}

export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ui = t(locale);
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const email = s(asObject(settings["contact.email"]).value), phone = s(asObject(settings["contact.phone"]).value);
  const address = bi(asObject(settings["contact.address"]).address, locale);

  return (
    <>
      <PageHead title={ui.formTitle} />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 md:px-12 lg:grid-cols-[1.4fr_1fr]" data-orb="page">
        <ContactForm locale={locale} services={services.data.map((x) => field(x, "title", locale))} budgets={ui.budgetOptions}
          labels={{ name: ui.name, company: ui.company, country: ui.country, email: ui.email, whatsappNumber: ui.whatsappNumber, service: ui.service, budget: ui.budget, details: ui.details, selectOne: ui.selectOne, other: ui.other, send: ui.send, sending: ui.sending, sent: ui.sent, sendAnother: ui.sendAnother }} />
        <aside className="h-fit space-y-4 rounded-[36px] border border-white/10 bg-card p-8 text-muted">
          {email && <p className="flex items-center gap-3"><Mail className="size-5 text-brand-light" aria-hidden /><a href={`mailto:${email}`} dir="ltr" className="hover:text-white">{email}</a></p>}
          {phone && <p className="flex items-center gap-3"><Phone className="size-5 text-brand-light" aria-hidden /><a href={`tel:${phone.replace(/\s/g, "")}`} dir="ltr" className="hover:text-white">{phone}</a></p>}
          {address && <p className="flex items-start gap-3"><MapPin className="mt-1 size-5 shrink-0 text-brand-light" aria-hidden />{address}</p>}
        </aside>
      </div>
    </>
  );
}
