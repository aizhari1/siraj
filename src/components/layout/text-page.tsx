import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { asObject, bi, s } from "@/lib/data";
import { paragraphs } from "@/lib/site";
import { Img } from "@/components/ui/media";

export function TextPage({ locale, value }: { locale: Locale; value: Record<string, unknown> | undefined }) {
  const v = asObject(value);
  const title = bi(v.title, locale), body = bi(v.body, locale), image = s(v.image);
  if (!title && !body) return <div className="grid min-h-[60svh] place-items-center px-5 pt-24 text-muted"><p>{t(locale).empty}</p></div>;
  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-32" data-orb="page">
      {title && <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{title}</h1>}
      {image && <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[40px] border border-white/10"><Img src={image} alt="" priority sizes="768px" className="object-cover" /></div>}
      <div className="mt-10 space-y-5 text-lg leading-relaxed text-muted">{paragraphs(body).map((p, i) => <p key={i}>{p}</p>)}</div>
    </article>
  );
}
