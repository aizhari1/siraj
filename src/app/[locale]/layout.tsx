import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dirOf, isLocale, locales } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { asObject, bi, getSettings, s } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp";
import { OrbLoader } from "@/components/world/orb-loader";
import "@/lib/fonts";
import "../globals.css";

export const revalidate = 60;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const st = await getSettings();
  const seo = asObject(st["seo.defaults"]);
  const title = bi(seo.title, locale) || "SIRAJ | سِراج";
  const description = bi(seo.description, locale) || undefined;
  const favicon = s(asObject(st["brand.favicon"]).url);
  const og = s(seo.og_image);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: title, template: `%s | ${title.split("|")[0].trim() || "SIRAJ"}` },
    description,
    icons: favicon ? { icon: mediaUrl(favicon) } : undefined,
    alternates: { languages: { ar: "/ar", en: "/en" } },
    openGraph: { title, description, locale: locale === "ar" ? "ar_EG" : "en_US", type: "website", images: og ? [mediaUrl(og)] : undefined },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const settings = await getSettings();
  const ui = t(locale);

  // Brand colors from Global Settings override the CSS variables at runtime
  const c = asObject(settings["brand.colors"]);
  const hex = (v: unknown) => (/^#[0-9a-f]{6}$/i.test(s(v)) ? s(v) : undefined);
  const theme: Record<string, string> = {};
  if (hex(c.background)) theme["--color-bg"] = hex(c.background)!;
  if (hex(c.surface)) theme["--color-surface"] = hex(c.surface)!;
  if (hex(c.card)) theme["--color-card"] = hex(c.card)!;
  if (hex(c.purple)) theme["--color-brand"] = hex(c.purple)!;
  if (hex(c.purple_light)) theme["--color-brand-light"] = hex(c.purple_light)!;
  if (hex(c.muted)) theme["--color-muted"] = hex(c.muted)!;

  return (
    <html lang={locale} dir={dirOf(locale)} style={theme as React.CSSProperties}>
      <body>
        <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2">{ui.skipToContent}</a>
        <OrbLoader />
        <Nav locale={locale} logo={s(asObject(settings["brand.logo"]).url)}
          labels={{ home: ui.home, about: ui.about, services: ui.services, portfolio: ui.portfolio, contact: ui.contact, menu: ui.menu, close: ui.close, language: ui.language }} />
        <main id="content" className="min-h-dvh">{children}</main>
        <Footer locale={locale} settings={settings} />
        <WhatsAppButton locale={locale} settings={settings} />
      </body>
    </html>
  );
}
