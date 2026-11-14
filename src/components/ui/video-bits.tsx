"use client";
import { useEffect, useRef } from "react";
import { mediaUrl } from "@/lib/media";
import { parseVideo } from "@/lib/site";

const saver = () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Looping silent video behind a section. Plays only while visible; skipped for reduced motion and data-saver. */
export function BgVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const file = parseVideo(src)?.kind === "file";
  useEffect(() => {
    const v = ref.current;
    if (!v || !file || calm() || saver()) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.1 });
    io.observe(v);
    return () => io.disconnect();
  }, [file]);
  if (!file) return null;
  return <video ref={ref} src={mediaUrl(src)} muted loop playsInline preload="metadata" aria-hidden className="absolute inset-0 -z-10 size-full object-cover opacity-35" />;
}

/** Silent preview inside a project card: plays on hover (mouse) or while centered (touch). */
export function HoverVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    const card = v?.closest(".pc");
    if (!v || !card || calm() || saver()) return;
    const play = () => v.play().catch(() => {}), stop = () => { v.pause(); };
    const touch = window.matchMedia("(hover: none)").matches;
    if (touch) {
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : stop()), { threshold: 0.7 });
      io.observe(v);
      return () => io.disconnect();
    }
    card.addEventListener("pointerenter", play); card.addEventListener("pointerleave", stop);
    return () => { card.removeEventListener("pointerenter", play); card.removeEventListener("pointerleave", stop); };
  }, []);
  return <video ref={ref} src={mediaUrl(src)} muted loop playsInline preload="none" aria-hidden className="vprev absolute inset-0 size-full object-cover" />;
}
