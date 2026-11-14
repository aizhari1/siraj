"use client";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import type { WorldConfig } from "@/types/content";
import { mediaUrl } from "@/lib/media";
import { CodeRain, Particles, Waves } from "./canvases";
import { rgba, useInView, useLite } from "./use-world";

const Scene3D = dynamic(() => import("./scene3d"), { ssr: false });
const SPEED = { calm: 0.6, flow: 1, energetic: 1.6 } as const;

/** Animated background ("world") for one section. Decorative only: hidden from assistive tech, never blocks content. */
export function World({ config, videoSrc }: { config: WorldConfig; videoSrc?: string }) {
  const reduced = useReducedMotion();
  const lite = useLite();
  const [ref, inView] = useInView<HTMLDivElement>();
  const accent = config.color_accent || "#8B5CF6";
  const k = Math.min(1, Math.max(0, config.intensity));
  const speed = SPEED[config.motion_preset] ?? 1;
  const live = inView && !reduced;
  const t = config.background_type;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 0%, ${rgba(accent, 0.18 * (0.5 + k))}, transparent 70%)` }} />

      {t === "aurora" && (
        <>
          <span className="world-blob left-[-10%] top-[10%] size-[40vw] rounded-full" style={{ background: rgba(accent, 0.35 * k), animationPlayState: live ? "running" : "paused" }} />
          <span className="world-blob right-[-10%] top-[40%] size-[35vw] rounded-full" style={{ background: rgba("#A78BFA", 0.28 * k), animationDelay: "-5s", animationPlayState: live ? "running" : "paused" }} />
        </>
      )}
      {t === "morph" && (
        <>
          <span className="world-morph left-[8%] top-[15%] size-[34vw]" style={{ background: `linear-gradient(135deg, ${rgba(accent, 0.45 * k)}, ${rgba("#A78BFA", 0.15)})`, animationPlayState: live ? "running" : "paused" }} />
          <span className="world-morph bottom-[5%] right-[6%] size-[26vw]" style={{ background: `linear-gradient(200deg, ${rgba("#A78BFA", 0.35 * k)}, transparent)`, animationDelay: "-6s", animationPlayState: live ? "running" : "paused" }} />
        </>
      )}
      {live && t === "particles" && <Particles accent={accent} intensity={k} speed={speed} lite={lite} parallax={config.parallax} />}
      {live && t === "code-rain" && <CodeRain accent={accent} intensity={k} speed={speed} lite={lite} />}
      {live && t === "waves" && <Waves accent={accent} intensity={k} speed={speed} lite={lite} />}
      {live && t === "scene-3d" && !lite && <div className="absolute inset-0 opacity-80"><Scene3D accent={accent} speed={speed} /></div>}
      {t === "scene-3d" && (lite || reduced) && <span className="world-morph left-1/2 top-1/2 size-[30vw] -translate-x-1/2 -translate-y-1/2" style={{ background: rgba(accent, 0.3 * k), animationPlayState: "paused" }} />}
      {t === "video" && videoSrc && !reduced && (
        <video className="absolute inset-0 size-full object-cover opacity-40" src={mediaUrl(videoSrc)} autoPlay muted loop playsInline preload="none" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/80" />
    </div>
  );
}
