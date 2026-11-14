import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { getProjects } from "@/lib/data";
import { PageHead } from "@/components/layout/page-head";
import { ProjectCards } from "@/components/sections/render";
import { Reveal } from "@/components/sections/motion";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).portfolio, alternates: { languages: { ar: "/ar/portfolio", en: "/en/portfolio" } } } : {};
}

export default async function Portfolio({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ui = t(locale);
  const { data, error } = await getProjects();
  return (
    <>
      <PageHead title={ui.portfolio} />
      <div className="mx-auto max-w-6xl px-5 pb-24 md:px-12" data-orb="projects">
        {error ? <p role="alert" className="text-muted">{ui.error}</p> : data.length === 0 ? <p className="text-muted">{ui.noProjects}</p>
          : <Reveal><ProjectCards list={data} locale={locale} /></Reveal>}
      </div>
    </>
  );
}
