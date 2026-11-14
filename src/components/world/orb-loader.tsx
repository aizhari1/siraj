"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Orb = dynamic(() => import("./orb"), { ssr: false });

/** Loads the 3D scene after the page is interactive, and skips it on very weak or data-saver devices (CSS glow remains). */
export function OrbLoader() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if ((nav.hardwareConcurrency ?? 8) <= 2 || nav.connection?.saveData) return;
    const ric = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 500));
    const id = ric(() => setOn(true));
    return () => { if (window.cancelIdleCallback) window.cancelIdleCallback(id as number); };
  }, []);
  return (
    <>
      <div id="orb-fallback" aria-hidden />
      <canvas id="orb-canvas" aria-hidden />
      {on && <Orb />}
    </>
  );
}
