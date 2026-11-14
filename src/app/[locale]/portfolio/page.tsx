import Link from "next/link";
import { getLocale } from "@/lib/i18n/config";
import { getProjects } from "@/lib/data";
import { ui } from "@/lib/i18n/ui";
import { Media } from "@/components/ui/media";

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  const locale = getLocale(loc);
  const t = ui[locale];
  const projects = await getProjects(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-10 text-4xl font-bold">{t.portfolio.title}</h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/${locale}/portfolio/${p.slug}`}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/20"
          >
            {p.cover && (
              <Media
                src={p.cover}
                alt={p.title}
                className="aspect-video w-full object-cover transition group-hover:scale-105"
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold">{p.title}</h2>
              {p.summary && <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
