import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { WhatsApp } from "@/components/layout/whatsapp";
import { PageTransition } from "@/components/layout/page-transition";
import { getLocale, locales } from "@/lib/i18n/config";
import { site } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  const locale = getLocale(loc);
  return {
    title: {
      default: site.name[locale],
      template: `%s | ${site.name[locale]}`,
    },
    description: site.description[locale],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  const locale = getLocale(loc);
  if (!locales.includes(locale)) notFound();

  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="min-h-screen flex flex-col">
      <Nav locale={locale} />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer locale={locale} />
      <WhatsApp />
    </div>
  );
}
