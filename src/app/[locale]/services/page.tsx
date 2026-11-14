import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { getServices } from "@/lib/data";
import { PageHead } from "@/components/layout/page-head";
import { ServiceGrid } from "@/components/sections/service-grid";
import { toServiceItems } from "@/components/sections/items";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).services, alternates: { languages: { ar: "/ar/services", en: "/en/services" } } } : {};
}

export default async function Services({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ui = t(locale);
  const { data, error } = await getServices();
  return (
    <>
      <PageHead title={ui.services} />
      <div className="mx-auto max-w-6xl px-5 pb-24 md:px-12" data-orb="services">
        {error ? <p role="alert" className="text-muted">{ui.error}</p> : data.length === 0 ? <p className="text-muted">{ui.noServices}</p> : <ServiceGrid items={toServiceItems(data, locale)} />}
      </div>
    </>
  );
}
