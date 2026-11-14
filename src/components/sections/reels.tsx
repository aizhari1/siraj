"use client";
import { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { parseVideo } from "@/lib/site";
import { Img } from "@/components/ui/media";
import { VideoPlayer } from "@/components/ui/video-player";

export type Reel = { src: string; poster: string; title: string };

function ReelCard({ r, onOpen, label }: { r: Reel; onOpen: () => void; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const file = parseVideo(r.src)?.kind === "file";
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.6 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <button type="button" onClick={onOpen} aria-label={`${label}: ${r.title}`}
      className="group relative aspect-[9/16] w-[62vw] max-w-[290px] shrink-0 snap-center overflow-hidden rounded-[32px] border border-white/10 bg-card text-start transition-all duration-500 [transition-timing-function:var(--sp)] hover:rounded-[44px] active:scale-95 md:w-[270px]">
      {r.poster && <Img src={r.poster} alt="" sizes="290px" className="object-cover" />}
      {file && <video ref={ref} src={mediaUrl(r.src)} muted loop playsInline preload="metadata" aria-hidden className="absolute inset-0 size-full object-cover" />}
      <span className="absolute inset-0 bg-gradient-to-t from-bg/85 via-transparent to-transparent" />
      <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        <span className="text-[17px] font-bold leading-snug">{r.title}</span>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-light text-[color:var(--onpri)]"><Play className="size-4 fill-current" aria-hidden /></span>
      </span>
    </button>
  );
}

/** Vertical video rail. Cards play silently while visible; tapping opens a full-size player with sound. */
export function Reels({ items, play, close }: { items: Reel[]; play: string; close: string }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);
  const cur = open !== null ? items[open] : null;
  return (
    <>
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map((r, i) => <ReelCard key={i} r={r} label={play} onOpen={() => setOpen(i)} />)}
      </div>
      <dialog ref={dlg} onClose={() => setOpen(null)} onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
        className="m-auto overflow-visible bg-transparent p-0 text-white backdrop:bg-black/80 backdrop:backdrop-blur-md">
        {cur && (
          <div className="relative aspect-[9/16] max-h-[88svh] w-[min(92vw,420px)] overflow-hidden rounded-[36px] border border-white/15 bg-black">
            <VideoPlayer key={open} src={cur.src} poster={cur.poster} title={cur.title} label={play} autoplay />
            <button type="button" onClick={() => setOpen(null)} aria-label={close} className="glass absolute end-3 top-3 z-10 grid size-11 place-items-center rounded-full"><X className="size-5" aria-hidden /></button>
          </div>
        )}
      </dialog>
    </>
  );
}
