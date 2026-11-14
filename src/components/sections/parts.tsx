import { Btn } from "./motion";
import { bi, asObject, s } from "@/lib/data";
import { resolveHref } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";

export const L = (v: unknown, locale: Locale) => bi(v, locale);

export function Buttons({ items, locale }: { items: unknown; locale: Locale }) {
  const list = Array.isArray(items) ? items : [];
  const shown = list.filter((b) => bi(asObject(b).label, locale) && s(asObject(b).href));
  if (!shown.length) return null;
  return (
    <div className="mt-8 flex flex-wrap gap-3" data-reveal>
      {shown.map((b, i) => {
        const o = asObject(b);
        const { href, external } = resolveHref(s(o.href), locale);
        return <Btn key={i} href={href} external={external} variant={o.variant === "ghost" ? "ghost" : "primary"}>{bi(o.label, locale)}</Btn>;
      })}
    </div>
  );
}

export function Heading({ content, locale, level = 2, centered }: { content: Record<string, unknown>; locale: Locale; level?: 1 | 2; centered?: boolean }) {
  const eyebrow = L(content.eyebrow, locale), heading = L(content.heading, locale), body = L(content.body, locale);
  if (!eyebrow && !heading && !body) return null;
  const H = level === 1 ? "h1" : "h2";
  return (
    <header className={`${centered ? "mx-auto text-center" : ""} max-w-3xl`}>
      {eyebrow && <p data-reveal className="lbl">{eyebrow}</p>}
      {heading && <H data-reveal className={`font-bold leading-[1.02] tracking-tight [html[lang=ar]_&]:leading-[1.22] [html[lang=ar]_&]:tracking-normal ${level === 1 ? "text-[clamp(2.75rem,9vw,8rem)]" : "text-[clamp(2rem,5.6vw,4.9rem)]"}`}>{heading}</H>}
      {body && <div data-reveal className="mt-6 space-y-4 text-lg leading-relaxed text-muted">{body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>}
    </header>
  );
}
