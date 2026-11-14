export const MEDIA_BUCKET = "siraj-media";
export type MediaFolder = "projects" | "services" | "sections" | "branding" | "testimonials";

/** DB stores storage paths (projects/uuid.webp). External https URLs pass through unchanged. */
export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
