"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { parseVideo } from "@/lib/site";
import { Img } from "./media";

/** Click-to-play: nothing heavy loads until the visitor asks for it. The parent supplies the size (relative + aspect ratio). */
export function VideoPlayer({ src, poster, title, label, autoplay = false }: { src: string; poster?: string; title: string; label: string; autoplay?: boolean }) {
  const [on, setOn] = useState(autoplay);
  const v = parseVideo(src);
  if (!v) return null;

  if (on) {
    return v.kind === "file"
      ? <video src={mediaUrl(v.src)} controls autoPlay playsInline className="absolute inset-0 size-full bg-black object-contain" />
      : <iframe src={`${v.src}${v.src.includes("?") ? "&" : "?"}autoplay=1`} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="absolute inset-0 size-full" />;
  }
  return (
    <button type="button" onClick={() => setOn(true)} aria-label={`${label}: ${title}`} className="group absolute inset-0 size-full">
      {poster ? <Img src={poster} alt="" sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover" /> : <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,color-mix(in_srgb,var(--color-brand)_55%,transparent),transparent_60%)]" />}
      <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-20 place-items-center rounded-[28px] bg-brand-light text-[color:var(--onpri)] shadow-2xl transition-all duration-500 [transition-timing-function:var(--sp)] group-hover:scale-110 group-hover:rounded-full group-active:scale-95">
          <Play className="size-8 fill-current" aria-hidden />
        </span>
      </span>
    </button>
  );
}
