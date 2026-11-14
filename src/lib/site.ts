import type { Locale } from "@/lib/i18n/config";

/** Resolve an admin-entered link: "/contact" becomes "/ar/contact"; external and anchor links pass through. */
export function resolveHref(href: string, locale: Locale): { href: string; external: boolean } {
  if (!href) return { href: `/${locale}`, external: false };
  if (/^(https?:|mailto:|tel:)/i.test(href)) return { href, external: !href.startsWith("mailto:") && !href.startsWith("tel:") };
  if (href.startsWith("#")) return { href, external: false };
  if (/^\/(ar|en)(\/|$)/.test(href)) return { href, external: false };
  return { href: `/${locale}${href === "/" ? "" : href}`, external: false };
}

export function parseVideo(url: string): { kind: "youtube" | "vimeo" | "file"; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "vimeo", src: `https://player.vimeo.com/video/${vm[1]}` };
  return { kind: "file", src: url };
}

export const paragraphs = (text: string) => text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
