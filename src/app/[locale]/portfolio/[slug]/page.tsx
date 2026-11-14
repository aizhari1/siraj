import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { field, getProject, s } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { paragraphs, parseVideo } from "@/lib/site";
import { Img } from "@/components/ui/media";
import { VideoPlayer } from "@/components/ui/video-player";

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const { data: p } = await getProject(slug);
  if (!p) return {};
  const title = field(p, "seo_title", locale) || field(p, "title", locale);
  const description = (field(p, "seo_description", locale) || field(p, "description", locale)).slice(0, 160);
  return {
    title, description: description || undefined,
    alternates: { languages: { ar: `/ar/portfolio/${slug}`, en: `/en/portfolio/${slug}` } },
    openGraph: { title, description: description || undefined, images: s(p.cover_image) ? [mediaUrl(s(p.cover_image))] : undefined },
  };
}

export default async function ProjectDetail({ params }: P) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const ui = t(locale);
  const { data: p, error } = await getProject(slug);
  if (error) return <div className="grid min-h-[60svh] place-items-center pt-24 text-muted"><p role="alert">{ui.error}</p></div>;
  if (!p) notFound();

  const title = field(p, "title", locale);
  const gallery = (Array.isArray(p.gallery) ? p.gallery : []).filter((x): x is string => typeof x === "string");
  const video = parseVideo(s(p.video_url));
  const blocks = [[ui.challenge, "challenge"], [ui.solution, "solution"], [ui.results, "results"]] as const;

  return (
    <article>
      <header className="relative isolate px-5 pb-10 pt-36 md:px-12" data-orb="page">
        <div className="mx-auto max-w-6xl">
          <p className="lbl">{s(p.category)}</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-7xl [html[lang=ar]_&]:leading-[1.2] [html[lang=ar]_&]:tracking-normal">{title}</h1>
          {s(p.client_name) && <p className="mt-4 text-muted">{ui.client}: {s(p.client_name)}</p>}
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-16 px-5 pb-24 md:px-12">
        {s(p.cover_image) && <div className="relative aspect-[16/9] overflow-hidden rounded-[40px] border border-white/10"><Img src={s(p.cover_image)} alt={title} priority sizes="(min-width: 1152px) 1100px, 100vw" className="object-cover" /></div>}

        {field(p, "description", locale) && <div className="max-w-3xl space-y-5 text-xl leading-relaxed">{paragraphs(field(p, "description", locale)).map((x, i) => <p key={i}>{x}</p>)}</div>}

        <div className="grid gap-6 md:grid-cols-3">
          {blocks.map(([label, base]) => field(p, base, locale) && (
            <section key={base} className="rounded-[32px] border border-white/10 bg-card p-7">
              <h2 className="mb-3 text-lg font-semibold text-brand-light">{label}</h2>
              <div className="space-y-3 text-muted">{paragraphs(field(p, base, locale)).map((x, i) => <p key={i}>{x}</p>)}</div>
            </section>
          ))}
        </div>

        {video && (
          <div className="relative aspect-video overflow-hidden rounded-[40px] border border-white/10 bg-black">
            <VideoPlayer src={s(p.video_url)} poster={s(p.cover_image)} title={title} label={ui.play} />
          </div>
        )}

        {gallery.length > 0 && (
          <section aria-label={ui.gallery}>
            <h2 className="mb-6 text-2xl font-semibold">{ui.gallery}</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {gallery.map((g, i) => <li key={g} className={`relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/10 ${i % 5 === 0 ? "sm:col-span-2 sm:aspect-[16/9]" : ""}`}><Img src={g} alt={`${title} ${i + 1}`} sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" /></li>)}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          {s(p.external_url) && <a href={s(p.external_url)} target="_blank" rel="noopener noreferrer" className="btn-m btn-pri">{ui.visitProject}<ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden /></a>}
          <Link href={`/${locale}/portfolio`} className="btn-m btn-ton">{ui.allProjects}</Link>
        </div>
      </div>
    </article>
  );
}
