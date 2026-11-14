import type { MetadataRoute } from "next";
import { getProjects, getServices } from "@/lib/data";
import { locales } from "@/lib/i18n/config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [projects, services] = await Promise.all([getProjects(), getServices()]);
  const paths = ["", "/about", "/services", "/portfolio", "/contact", "/privacy",
    ...services.data.map((s) => `/services/${s.slug}`), ...projects.data.map((p) => `/portfolio/${p.slug}`)];
  return paths.flatMap((p) => locales.map((l) => ({
    url: `${base}/${l}${p}`,
    lastModified: new Date(),
    alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${base}/${x}${p}`])) },
  })));
}
