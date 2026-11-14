"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Box, Clapperboard, Code2, Cpu, Globe, Layers, Megaphone, Palette, PenTool, Smartphone, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = { code: Code2, cpu: Cpu, smartphone: Smartphone, globe: Globe, megaphone: Megaphone, "trending-up": TrendingUp, clapperboard: Clapperboard, sparkles: Sparkles, palette: Palette, "pen-tool": PenTool, layers: Layers, box: Box };
/** Which 3D shape the orb morphs into for each icon family: 0 cube, 1 cone, 2 knot, 3 octahedron, 4 torus */
const SHAPE: Record<string, number> = { code: 0, cpu: 0, smartphone: 0, globe: 0, megaphone: 1, "trending-up": 1, clapperboard: 2, sparkles: 2, palette: 3, "pen-tool": 3, layers: 3, box: 4 };

export type ServiceItem = { id: string; href: string; title: string; description: string; icon: string; cta: string };

/** Tonal expressive cards. Hovering (or scrolling a card to the middle of the screen) morphs the card and the 3D orb. */
export function ServiceGrid({ items }: { items: ServiceItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.k)); }), { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items]);

  useEffect(() => {
    const icon = active === null ? undefined : items[active]?.icon;
    window.dispatchEvent(new CustomEvent("siraj:shape", { detail: active === null ? null : SHAPE[icon ?? ""] ?? 3 }));
  }, [active, items]);
  useEffect(() => () => { window.dispatchEvent(new CustomEvent("siraj:shape", { detail: null })); }, []);

  return (
    <ul className="svc-grid">
      {items.map((it, i) => {
        const Icon = ICONS[it.icon] ?? Sparkles;
        return (
          <li key={it.id} data-reveal>
            <Link href={it.href} ref={(el) => { refs.current[i] = el; }} data-k={i} onPointerEnter={() => setActive(i)}
              className={`svc t${i % 5} h-full ${active === i ? "on" : ""}`}>
              <span className={`ck c${i % 5}`}><Icon className="size-7" aria-hidden strokeWidth={1.8} /></span>
              <span className="relative block">
                <span className="block text-[26px] font-bold leading-tight">{it.title}</span>
                <span className="mt-2 block max-w-[30ch] text-[15px] text-white/80">{it.description}</span>
              </span>
              <span className="go" aria-label={it.cta}><ArrowUpRight className="size-5" aria-hidden /></span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
