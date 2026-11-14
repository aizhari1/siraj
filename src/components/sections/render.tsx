import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Section, WorldConfig } from "@/types/content";
import { defaultWorld } from "@/types/content";
import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { asObject, field, s, type Row } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { parseVideo } from "@/lib/site";
import { Play } from "lucide-react";
import { World } from "@/components/world/world";
import { Img } from "@/components/ui/media";
import { Counter, Reveal } from "./motion";
import { Buttons, Heading, L } from "./parts";
import { ServiceGrid } from "./service-grid";
import { ProcessWave } from "./process-wave";
import { Reels } from "./reels";
import { VideoPlayer } from "@/components/ui/video-player";
import { BgVideo, HoverVideo } from "@/components/ui/video-bits";
import { toServiceItems } from "./items";

export type SectionData = { services: Row[]; projects: Row[]; testimonials: Row[] };

/** Which pose the global 3D orb takes while a section is on screen. */
const POSE: Partial<Record<Section["section_type"], string>> = {
  hero: "hero", services_grid: "services", projects_grid: "projects", statistics: "stats", process_timeline: "process", cta: "cta",
  text_image: "page", custom_content: "page", testimonials: "projects", faq: "page", logo_wall: "page", video_showcase: "page", reels: "projects",
};

function worldOf(section: Section): WorldConfig {
  return { ...defaultWorld, ...(asObject(asObject(section.settings).world) as Partial<WorldConfig>) };
}

function Shell({ section, children, id }: { section: Section; children: React.ReactNode; id?: string }) {
  const st = asObject(section.settings);
  const vis = asObject(st.visibility);
  const bg = asObject(st.background);
  const hide = vis.desktop === false ? "md:hidden" : vis.mobile === false ? "max-md:hidden" : "";
  const kind = s(bg.kind), val = s(bg.value);
  const style: React.CSSProperties = {};
  if (kind === "solid" && /^#[0-9a-f]{6}$/i.test(val)) style.background = val;
  if (kind === "gradient" && /^#[0-9a-f]{6}$/i.test(val)) style.background = `linear-gradient(180deg, ${val}, var(--color-bg))`;
  const world = worldOf(section);
  return (
    <section id={id} data-section={section.section_type} data-orb={POSE[section.section_type]} style={style} className={`relative isolate overflow-hidden py-24 md:py-36 ${hide}`}>
      {kind === "image" && val && <div className="absolute inset-0 -z-20 opacity-30"><Img src={val} alt="" sizes="100vw" className="object-cover" /></div>}
      <World config={world} />
      {kind === "video" && val && <BgVideo src={val} />}
      <Reveal className="mx-auto max-w-6xl px-5">{children}</Reveal>
    </section>
  );
}

const layoutOf = (section: Section) => s(asObject(section.settings).layout) || "default";
const mediaOf = (v: unknown) => { const o = asObject(v); return { url: s(o.url), alt: o.alt }; };
const frame = "relative overflow-hidden rounded-[40px] border border-white/10 bg-card";

export function RenderSection({ section, locale, data }: { section: Section; locale: Locale; data: SectionData }) {
  const c = asObject(section.content);
  const layout = layoutOf(section);
  const centered = layout === "centered";
  const ui = t(locale);
  const lim = (n: unknown, arr: Row[]) => (Number(n) > 0 ? arr.slice(0, Number(n)) : arr);

  switch (section.section_type) {
    case "hero": {
      const media = mediaOf(c.media), video = s(c.video_url);
      const hasMedia = Boolean(media.url || video);
      return (
        <Shell section={section}>
          <div className={`grid min-h-[84svh] items-center gap-12 ${hasMedia && !centered ? "lg:grid-cols-[1.2fr_1fr]" : ""}`}>
            <div className={centered ? "text-center" : ""}>
              <Heading content={c} locale={locale} level={1} centered={centered} />
              {data.services.length > 0 && (
                <ul data-reveal className={`mt-8 flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}>
                  {data.services.slice(0, 6).map((sv) => <li key={sv.id} className="chip">{field(sv, "title", locale)}</li>)}
                </ul>
              )}
              <div className={centered ? "flex justify-center" : ""}><Buttons items={c.buttons} locale={locale} /></div>
            </div>
            {hasMedia && (
              <div data-reveal className={`${frame} aspect-[4/5]`}>
                {video && !/^https?:\/\/(www\.)?(youtu|vimeo)/i.test(video)
                  ? <video src={mediaUrl(video)} autoPlay muted loop playsInline className="size-full object-cover" />
                  : <Img src={media.url} alt={L(media.alt, locale)} priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />}
              </div>
            )}
          </div>
        </Shell>
      );
    }
    case "text_image":
    case "custom_content": {
      const img = mediaOf(c.image);
      return (
        <Shell section={section}>
          <div className={`grid items-center gap-12 ${img.url && !centered ? "lg:grid-cols-2" : ""}`}>
            <div className={`${layout === "reverse" ? "lg:order-2" : ""} ${centered ? "text-center" : ""}`}>
              <Heading content={c} locale={locale} centered={centered} />
              <div className={centered ? "flex justify-center" : ""}><Buttons items={c.buttons} locale={locale} /></div>
            </div>
            {img.url && <div data-reveal className={`${frame} aspect-[4/3]`}><Img src={img.url} alt={L(img.alt, locale)} className="object-cover" /></div>}
          </div>
        </Shell>
      );
    }
    case "services_grid": {
      const list = lim(c.limit, data.services);
      return (
        <Shell section={section}>
          <Heading content={c} locale={locale} centered={centered} />
          <div className="mt-14">{list.length === 0 ? <p className="text-muted">{ui.noServices}</p> : <ServiceGrid items={toServiceItems(list, locale)} />}</div>
        </Shell>
      );
    }
    case "projects_grid": {
      const base = c.only_featured ? data.projects.filter((p) => p.is_featured) : data.projects;
      const list = lim(c.limit, base);
      return (
        <Shell section={section}>
          <Heading content={c} locale={locale} centered={centered} />
          <div className="mt-14">{list.length === 0 ? <p className="text-muted">{ui.noProjects}</p> : <ProjectCards list={list} locale={locale} />}</div>
        </Shell>
      );
    }
    case "video_showcase": {
      const poster = mediaOf(c.poster), src = s(c.video_url);
      return (
        <Shell section={section}>
          <Heading content={c} locale={locale} centered={centered} />
          {src && (
            <div data-reveal className={`${frame} mt-12 aspect-video bg-black`}>
              <VideoPlayer src={src} poster={poster.url} title={L(c.heading, locale) || "Video"} label={ui.play} />
            </div>
          )}
        </Shell>
      );
    }
    case "reels": {
      const items = (Array.isArray(c.items) ? c.items : []).map((it) => ({ src: s(asObject(it).video), poster: s(asObject(asObject(it).poster).url), title: L(asObject(it).title, locale) })).filter((r) => r.src);
      return (
        <Shell section={section}>
          <Heading content={c} locale={locale} centered={centered} />
          {items.length > 0 && <div data-reveal className="mt-12"><Reels items={items} play={ui.play} close={ui.close} /></div>}
        </Shell>
      );
    }
    case "statistics": {
      const items = Array.isArray(c.items) ? c.items : [];
      return (
        <Shell section={section}>
          <Heading content={c} locale={locale} centered={centered} />
          <dl className="tiles mt-14">
            {items.map((it, i) => (
              <div key={i} data-reveal className={`tile k${i % 4}`}>
                <dd className="m-0 block text-[clamp(2.75rem,6vw,5.25rem)] font-bold leading-none tracking-tight" dir="ltr"><Counter value={s(asObject(it).value)} /></dd>
                <dt className="text-[15px] text-white/85">{L(asObject(it).label, locale)}</dt>
              </div>
            ))}
          </dl>
        </Shell>
      );
    }
    case "testimonials": {
      const list = lim(c.limit, data.testimonials);
      return (
        <Shell section={section}>
          <Heading content={c} locale={locale} centered={centered} />
          {list.length === 0 ? <p className="mt-10 text-muted">{ui.noTestimonials}</p> : (
            <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list.map((x, i) => (
                <li key={x.id} data-reveal style={{ marginTop: i % 3 === 1 ? "1.5rem" : 0 }} className="rounded-[32px] border border-white/10 bg-card p-7">
                  <blockquote className="text-lg leading-relaxed">“{field(x, "content", locale)}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    {s(x.image) && <span className="relative size-12 overflow-hidden rounded-[18px]"><Img src={s(x.image)} alt="" sizes="48px" className="object-cover" /></span>}
                    <span><span className="block font-medium">{s(x.client_name)}</span><span className="text-sm text-muted">{[s(x.position), s(x.company)].filter(Boolean).join(" · ")}</span></span>
                  </figcaption>
                </li>
              ))}
            </ul>
          )}
        </Shell>
      );
    }
    case "faq": {
      const items = Array.isArray(c.items) ? c.items : [];
      return (
        <Shell section={section}>
          <Heading content={c} locale={locale} centered={centered} />
          <div className="mx-auto mt-12 max-w-3xl space-y-3">
            {items.map((it, i) => (
              <details key={i} data-reveal className="group rounded-[28px] border border-white/10 bg-card p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">{L(asObject(it).q, locale)}<span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-light/15 text-brand-light transition duration-500 group-open:rotate-45 group-open:rounded-xl" aria-hidden>+</span></summary>
                <p className="mt-3 text-muted">{L(asObject(it).a, locale)}</p>
              </details>
            ))}
          </div>
        </Shell>
      );
    }
    case "logo_wall": {
      const logos = (Array.isArray(c.logos) ? c.logos : []).map(mediaOf).filter((l) => l.url);
      return (
        <Shell section={section}>
          <Heading content={c} locale={locale} centered />
          <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {logos.map((l, i) => <li key={i} data-reveal className="relative h-24 rounded-[28px] border border-white/10 bg-card opacity-70 transition hover:opacity-100"><Img src={l.url} alt={L(l.alt, locale)} sizes="200px" className="object-contain p-5" /></li>)}
          </ul>
        </Shell>
      );
    }
    case "process_timeline": {
      const steps = Array.isArray(c.steps) ? c.steps : [];
      return (
        <Shell section={section}>
          <Heading content={c} locale={locale} centered={centered} />
          <ProcessWave>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((st, i) => (
                <li key={i} data-reveal className="step">
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  <h3 className="mb-1.5 mt-5 text-[22px] font-bold">{L(asObject(st).title, locale)}</h3>
                  <p className="text-[15px] text-muted">{L(asObject(st).body, locale)}</p>
                </li>
              ))}
            </ol>
          </ProcessWave>
        </Shell>
      );
    }
    case "cta":
      return (
        <Shell section={section}>
          <div className="flex min-h-[70svh] items-center">
            <div data-reveal className="box glass w-full">
              <Heading content={c} locale={locale} centered />
              <div className="flex justify-center"><Buttons items={c.buttons} locale={locale} /></div>
            </div>
          </div>
        </Shell>
      );
  }
}

export function ProjectCards({ list, locale }: { list: Row[]; locale: Locale }) {
  const ui = t(locale);
  return (
    <>
      <ul className="m-car scroll">
        {list.map((p, i) => (
          <li key={p.id} data-reveal>
            <Link href={`/${locale}/portfolio/${s(p.slug)}`} className="pc">
              <div className="art">
                {s(p.cover_image)
                  ? <Img src={s(p.cover_image)} alt={field(p, "title", locale)} sizes="(min-width: 768px) 33vw, 82vw" className="object-cover" />
                  : <div className="fill" style={{ filter: `hue-rotate(${i * 28}deg)` }} />}
                {parseVideo(s(p.video_url))?.kind === "file" && <HoverVideo src={s(p.video_url)} />}
                {s(p.video_url) && <span className="glass absolute bottom-3.5 end-3.5 grid size-9 place-items-center rounded-full" aria-hidden><Play className="size-3.5 fill-current" /></span>}
                {s(p.category) && <span className="tag glass">{s(p.category)}</span>}
              </div>
              <div className="cap">
                <div><small>{String(i + 1).padStart(2, "0")}</small><h3>{field(p, "title", locale)}</h3></div>
                <span className="fab" aria-label={ui.viewProject}><ArrowUpRight className="size-5" aria-hidden /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
