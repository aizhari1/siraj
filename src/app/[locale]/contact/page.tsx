import { ContactForm } from "@/components/layout/contact-form";
import { getLocale } from "@/lib/i18n/config";
import { ui } from "@/lib/i18n/ui";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  const locale = getLocale(loc);
  const t = ui[locale];

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold">{t.contact.title}</h1>
      <p className="mb-8 text-muted-foreground">{t.contact.subtitle}</p>
      <ContactForm locale={locale} />
    </div>
  );
}
