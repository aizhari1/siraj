"use client";
import { useEffect, useRef } from "react";
import { rgba, useCanvas } from "./use-world";

type P = { accent: string; intensity: number; speed: number; lite: boolean };
const cap = (l: boolean) => ({ dprCap: l ? 1 : 1.5, fps: l ? 30 : 60 });

export function Particles({ accent, intensity, speed, lite, parallax }: P & { parallax: boolean }) {
  const pointer = useRef({ x: -9999, y: -9999 });
  useEffect(() => {
    if (!parallax || lite) return;
    const move = (e: PointerEvent) => { pointer.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [parallax, lite]);

  const ref = useCanvas((w, h) => {
    const n = Math.round((lite ? 28 : 70) * (0.4 + intensity));
    const pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35 * speed, vy: (Math.random() - 0.5) * 0.35 * speed, r: 0.8 + Math.random() * 1.8 }));
    return (_t, ctx, W, H) => {
      ctx.clearRect(0, 0, W, H);
      const rect = ctx.canvas.getBoundingClientRect();
      const px = pointer.current.x - rect.left, py = pointer.current.y - rect.top;
      for (const p of pts) {
        const dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { const f = (1 - d2 / 14000) * 1.6; p.x += (dx / Math.sqrt(d2 || 1)) * f; p.y += (dy / Math.sqrt(d2 || 1)) * f; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.fillStyle = rgba(accent, 0.35 + intensity * 0.5);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      if (lite) return;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = dx * dx + dy * dy;
        if (d < 9000) { ctx.strokeStyle = rgba(accent, (1 - d / 9000) * 0.25 * intensity); ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
      }
    };
  }, cap(lite));
  return <canvas ref={ref} className="absolute inset-0 size-full" />;
}

export function CodeRain({ accent, intensity, speed, lite }: P) {
  const ref = useCanvas((w) => {
    const size = lite ? 18 : 15, cols = Math.ceil(w / size);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    const glyphs = "01{}[]<>/\\=+*;:#$%&アイウエオ";
    return (_t, ctx, W, H) => {
      ctx.fillStyle = "rgba(11,13,16,0.12)"; ctx.fillRect(0, 0, W, H);
      ctx.font = `${size}px ui-monospace, monospace`;
      for (let i = 0; i < drops.length; i++) {
        if (Math.random() > 0.35 + intensity * 0.5) continue;
        const ch = glyphs[(Math.random() * glyphs.length) | 0];
        ctx.fillStyle = rgba(accent, 0.25 + intensity * 0.45);
        ctx.fillText(ch, i * size, drops[i] * size);
        if (drops[i] * size > H && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5 * speed;
      }
    };
  }, cap(lite));
  return <canvas ref={ref} className="absolute inset-0 size-full opacity-70" />;
}

export function Waves({ accent, intensity, speed, lite }: P) {
  const ref = useCanvas(() => (t, ctx, W, H) => {
    ctx.clearRect(0, 0, W, H);
    const layers = lite ? 3 : 5;
    for (let l = 0; l < layers; l++) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += lite ? 12 : 6) {
        const y = H * (0.45 + l * 0.08) + Math.sin(x * 0.006 + t * 0.0006 * speed + l) * (18 + l * 10) * (0.5 + intensity) + Math.sin(x * 0.013 - t * 0.0004 * speed) * 8;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(accent, 0.12 + (l / layers) * 0.35 * intensity); ctx.lineWidth = 1.4; ctx.stroke();
    }
  }, cap(lite));
  return <canvas ref={ref} className="absolute inset-0 size-full" />;
}
