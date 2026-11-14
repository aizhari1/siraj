"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** True while the element is on screen. Canvases only run in view to protect battery and mobile performance. */
export function useInView<T extends HTMLElement>(margin = "120px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

/** Cheap capability check: small screens, few cores, low memory or data-saver get lighter effects. */
const subscribeNoop = () => () => {};
const readLite = () => {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return window.innerWidth < 768 || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || Boolean(nav.connection?.saveData);
};
export const useLite = () => useSyncExternalStore(subscribeNoop, readLite, () => false);

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** Runs `draw` every frame on a DPR-capped canvas that tracks its container size. */
export function useCanvas(
  setup: (w: number, h: number) => (t: number, ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  { dprCap, fps }: { dprCap: number; fps: number },
) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const setupRef = useRef(setup);
  useEffect(() => { setupRef.current = setup; });
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    let raf = 0, last = 0, w = 0, h = 0, draw: ReturnType<typeof setup>;
    const fit = () => {
      const r = c.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      w = r.width; h = r.height;
      c.width = Math.max(1, Math.floor(w * dpr)); c.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw = setupRef.current(w, h);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c.parentElement!);
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (t - last < 1000 / fps) return;
      last = t;
      draw(t, ctx, w, h);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [dprCap, fps]);
  return canvas;
}
