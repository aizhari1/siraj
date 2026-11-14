"use client";
import { useEffect, useRef } from "react";

const D = (() => { let d = "M0,15"; for (let x = 10; x <= 800; x += 10) d += ` L${x},${(15 + Math.sin((x / 800) * Math.PI * 10) * 8).toFixed(1)}`; return d; })();

/** Wavy progress line (Material 3 Expressive) that fills as the visitor scrolls through the steps. */
export function ProcessWave({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--p", String(Math.max(0, Math.min(1, (window.innerHeight * 0.75 - r.top) / (window.innerHeight * 0.55)))));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div ref={ref} className="mt-14">
      <div className="wave" aria-hidden><svg viewBox="0 0 800 30" preserveAspectRatio="none"><path className="wt" d={D} /><path className="wp" d={D} pathLength={1} /></svg></div>
      {children}
    </div>
  );
}
