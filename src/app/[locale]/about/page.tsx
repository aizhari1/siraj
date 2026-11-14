import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { asObject, bi, getSettings } from "@/lib/data";
import { TextPage } from "@/components/layout/text-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = bi(asObject((await getSettings())["page.about"]).title, locale);
  return { title: t || undefined, alternates: { languages: { ar: "/ar/about", en: "/en/about" } } };
}
export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <TextPage locale={locale} value={(await getSettings())["page.about"]} />;
}
