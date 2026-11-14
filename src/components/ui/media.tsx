import Image from "next/image";
import { mediaUrl } from "@/lib/media";

/** Optimized image for Supabase-hosted files; plain <img> for external links. */
export function Img({ src, alt, sizes = "(min-width: 1024px) 50vw, 100vw", className = "", priority = false, fill = true }: {
  src: string; alt: string; sizes?: string; className?: string; priority?: boolean; fill?: boolean;
}) {
  const url = mediaUrl(src);
  if (!url) return null;
  const hosted = url.includes("/storage/v1/object/public/");
  if (!hosted) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt} loading={priority ? "eager" : "lazy"} className={`absolute inset-0 size-full ${className}`} />;
  }
  return <Image src={url} alt={alt} fill={fill} sizes={sizes} priority={priority} className={className} />;
}
