import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { asObject, bi, field, getService, s } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { paragraphs } from "@/lib/site";
import { PageHead } from "@/components/layout/page-head";
import { Img } from "@/components/ui/media";

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const { data } = await getService(slug);
  if (!data) return {};
  const desc = field(data, "description", locale).slice(0, 160);
  return {
    title: field(data, "title", locale), description: desc || undefined,
    alternates: { languages: { ar: `/ar/services/${slug}`, en: `/en/services/${slug}` } },
    openGraph: s(data.image) ? { images: [mediaUrl(s(data.image))] } : undefined,
  };
}

export default async function ServiceDetail({ params }: P) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const ui = t(locale);
  const { data: sv, error } = await getService(slug);
  if (error) return <div className="grid min-h-[60svh] place-items-center pt-24 text-muted"><p role="alert">{ui.error}</p></div>;
  if (!sv) notFound();
  const features = (Array.isArray(sv.features) ? sv.features : []).map((f) => bi(asObject(f), locale)).filter(Boolean);
  return (
    <>
      <PageHead title={field(sv, "title", locale)} />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 md:px-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          {s(sv.image) && <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-[40px] border border-white/10"><Img src={s(sv.image)} alt={field(sv, "title", locale)} priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" /></div>}
          <div className="space-y-5 text-lg leading-relaxed text-muted">{paragraphs(field(sv, "description", locale)).map((p, i) => <p key={i}>{p}</p>)}</div>
        </div>
        <aside className="space-y-6 lg:pt-2">
          {features.length > 0 && (
            <div className="rounded-[32px] border border-white/10 bg-card p-7">
              <h2 className="mb-4 text-lg font-semibold">{ui.features}</h2>
              <ul className="space-y-3">{features.map((f, i) => <li key={i} className="flex gap-3"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-brand-light/15"><Check className="size-4 text-brand-light" aria-hidden /></span>{f}</li>)}</ul>
            </div>
          )}
          <Link href={`/${locale}/contact`} className="btn-m btn-pri w-full">{ui.formTitle}</Link>
        </aside>
      </div>
    </>
  );
}
