"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** GSAP ScrollTrigger reveal: any descendant with data-reveal fades and rises into view. Skipped when the visitor prefers reduced motion. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useIso(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const items = root.current?.querySelectorAll<HTMLElement>("[data-reveal]");
      if (!items?.length) return;
      gsap.from(items, { opacity: 0, y: 36, duration: 0.9, ease: "power3.out", stagger: 0.09, clearProps: "opacity,transform", scrollTrigger: { trigger: root.current, start: "top 82%", once: true } });
    });
    return () => mm.revert();
  }, []);
  return <div ref={root} className={className}>{children}</div>;
}

/** Counts up to a value such as "120+" or "98%" when it scrolls into view. */
export function Counter({ value }: { value: string }) {
  const m = value.match(/^(\D*)([\d.,]+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const target = m ? Number(m[2].replace(/,/g, "")) : 0;
  useEffect(() => {
    if (!m || !inView || reduced || !ref.current) return;
    const el = ref.current;
    const c = animate(0, target, { duration: 1.6, ease: "easeOut", onUpdate: (v) => { el.textContent = `${m[1]}${Math.round(v).toLocaleString("en-US")}${m[3]}`; } });
    return () => c.stop();
  }, [inView, reduced, target]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref} dir="ltr">{value}</span>;
}

/** Button that gently follows the cursor on desktop. */
export function Btn({ href, external, variant, children }: { href: string; external: boolean; variant: "primary" | "ghost"; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const cls = `btn-m ${variant === "primary" ? "btn-pri" : "btn-ton"}`;
  return (
    <motion.div style={reduced ? undefined : { x, y }} className="inline-block"
      onPointerMove={(e) => { if (reduced || e.pointerType !== "mouse") return; const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * 0.25); y.set((e.clientY - r.top - r.height / 2) * 0.25); }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      {external ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a> : <Link href={href} className={cls}>{children}</Link>}
    </motion.div>
  );
}
