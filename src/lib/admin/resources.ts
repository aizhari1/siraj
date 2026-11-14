import type { MediaFolder } from "@/lib/media";

export type FieldType =
  | "text" | "textarea" | "number" | "boolean" | "slug" | "url"
  | "image" | "video" | "gallery" | "bilist" | "select";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  group: string;
  rtl?: boolean;
  required?: boolean;
  nullable?: boolean;
  help?: string;
  slugFrom?: string;
  options?: string[];
};

export type ResourceKey = "projects" | "services" | "testimonials";

export type Resource = {
  key: ResourceKey;
  table: string;
  label: string;
  singular: string;
  folder: MediaFolder;
  titleField: string;
  subtitleField: string;
  publishedField: string;
  featuredField?: string;
  fields: Field[];
};

const t = (name: string, label: string, group: string, extra: Partial<Field> = {}): Field => ({
  name, label, group, type: "text", ...extra,
});

const publishing = (featured: boolean): Field[] => [
  ...(featured ? [{ name: "is_featured", label: "Featured on homepage", type: "boolean" as const, group: "Publishing" }] : []),
  { name: "is_published", label: "Published (visible to visitors)", type: "boolean", group: "Publishing" },
  { name: "display_order", label: "Display order (lower shows first)", type: "number", group: "Publishing" },
];

export const resources: Record<ResourceKey, Resource> = {
  projects: {
    key: "projects", table: "projects", label: "Projects", singular: "project", folder: "projects",
    titleField: "title_en", subtitleField: "category", publishedField: "is_published", featuredField: "is_featured",
    fields: [
      t("title_ar", "Title (Arabic)", "Basics", { required: true, rtl: true }),
      t("title_en", "Title (English)", "Basics", { required: true }),
      t("slug", "Slug", "Basics", { type: "slug", required: true, slugFrom: "title_en", help: "Used in the page address. Lowercase letters, numbers and hyphens." }),
      t("category", "Category", "Basics", { required: true }),
      t("client_name", "Client (optional)", "Basics", { nullable: true }),
      t("description_ar", "Description (Arabic)", "Content", { type: "textarea", rtl: true, nullable: true }),
      t("description_en", "Description (English)", "Content", { type: "textarea", nullable: true }),
      t("challenge_ar", "Challenge (Arabic)", "Case study", { type: "textarea", rtl: true, nullable: true }),
      t("challenge_en", "Challenge (English)", "Case study", { type: "textarea", nullable: true }),
      t("solution_ar", "Solution (Arabic)", "Case study", { type: "textarea", rtl: true, nullable: true }),
      t("solution_en", "Solution (English)", "Case study", { type: "textarea", nullable: true }),
      t("results_ar", "Results (Arabic)", "Case study", { type: "textarea", rtl: true, nullable: true }),
      t("results_en", "Results (English)", "Case study", { type: "textarea", nullable: true }),
      t("cover_image", "Cover image", "Media", { type: "image", nullable: true }),
      t("gallery", "Gallery", "Media", { type: "gallery" }),
      t("video_url", "Video URL or path", "Media", { type: "video", nullable: true }),
      t("external_url", "External URL", "Media", { type: "url", nullable: true }),
      t("seo_title_ar", "SEO title (Arabic)", "SEO", { rtl: true, nullable: true, help: "Up to 70 characters." }),
      t("seo_title_en", "SEO title (English)", "SEO", { nullable: true }),
      t("seo_description_ar", "SEO description (Arabic)", "SEO", { type: "textarea", rtl: true, nullable: true, help: "Up to 170 characters." }),
      t("seo_description_en", "SEO description (English)", "SEO", { type: "textarea", nullable: true }),
      ...publishing(true),
    ],
  },
  services: {
    key: "services", table: "services", label: "Services", singular: "service", folder: "services",
    titleField: "title_en", subtitleField: "slug", publishedField: "is_published",
    fields: [
      t("title_ar", "Title (Arabic)", "Basics", { required: true, rtl: true }),
      t("title_en", "Title (English)", "Basics", { required: true }),
      t("slug", "Slug", "Basics", { type: "slug", required: true, slugFrom: "title_en", help: "Lowercase letters, numbers and hyphens." }),
      t("icon", "Icon and hover effect", "Basics", { type: "select", nullable: true, options: ["code", "cpu", "smartphone", "globe", "megaphone", "trending-up", "clapperboard", "sparkles", "palette", "pen-tool", "layers", "box"], help: "The icon also picks the animated mini-world shown when a visitor hovers the card." }),
      t("description_ar", "Description (Arabic)", "Content", { type: "textarea", rtl: true, nullable: true }),
      t("description_en", "Description (English)", "Content", { type: "textarea", nullable: true }),
      t("features", "Features", "Content", { type: "bilist" }),
      t("image", "Cover image", "Media", { type: "image", nullable: true }),
      ...publishing(false),
    ],
  },
  testimonials: {
    key: "testimonials", table: "testimonials", label: "Testimonials", singular: "testimonial", folder: "testimonials",
    titleField: "client_name", subtitleField: "company", publishedField: "is_published",
    fields: [
      t("client_name", "Client name", "Basics", { required: true }),
      t("company", "Company", "Basics", { nullable: true }),
      t("position", "Position", "Basics", { nullable: true }),
      t("content_ar", "Testimonial (Arabic)", "Content", { type: "textarea", rtl: true, help: "Fill in at least one language." }),
      t("content_en", "Testimonial (English)", "Content", { type: "textarea" }),
      t("image", "Photo", "Media", { type: "image", nullable: true }),
      ...publishing(false),
    ],
  },
};

export const isResourceKey = (k: string): k is ResourceKey => k in resources;
