export type Bilingual = { ar: string; en: string };

export type ButtonConfig = { label: Bilingual; href: string; variant: "primary" | "ghost" };

export type MediaRef = { url: string; alt: Bilingual };

/** Animated background presets. One "world" per section. */
export type WorldBackground =
  | "none"
  | "particles"
  | "aurora"
  | "code-rain"
  | "waves"
  | "morph"
  | "scene-3d"
  | "video";

export type WorldConfig = {
  background_type: WorldBackground;
  intensity: number; // 0..1
  color_accent: string; // hex, defaults to brand purple
  motion_preset: "calm" | "flow" | "energetic";
  parallax: boolean;
};

export const defaultWorld: WorldConfig = {
  background_type: "aurora",
  intensity: 0.6,
  color_accent: "#8B5CF6",
  motion_preset: "flow",
  parallax: true,
};

export type SectionSettings = {
  world: WorldConfig;
  layout: "default" | "reverse" | "centered" | "split";
  background: { kind: "solid" | "gradient" | "image" | "video"; value?: string };
  visibility: { desktop: boolean; mobile: boolean };
};

type Base<T extends string, C> = {
  id: string;
  section_type: T;
  title: string;
  content: C;
  settings: SectionSettings;
  is_enabled: boolean;
  display_order: number;
};

type Heading = { eyebrow?: Bilingual; heading: Bilingual; body?: Bilingual };

export type Section =
  | Base<"hero", Heading & { buttons: ButtonConfig[]; media?: MediaRef; video_url?: string }>
  | Base<"text_image", Heading & { image?: MediaRef; buttons: ButtonConfig[] }>
  | Base<"services_grid", Heading & { limit?: number }>
  | Base<"projects_grid", Heading & { only_featured: boolean; limit?: number }>
  | Base<"video_showcase", Heading & { video_url: string; poster?: MediaRef }>
  | Base<"statistics", Heading & { items: { value: string; label: Bilingual }[] }>
  | Base<"testimonials", Heading & { limit?: number }>
  | Base<"faq", Heading & { items: { q: Bilingual; a: Bilingual }[] }>
  | Base<"logo_wall", Heading & { logos: MediaRef[] }>
  | Base<"process_timeline", Heading & { steps: { title: Bilingual; body: Bilingual }[] }>
  | Base<"cta", Heading & { buttons: ButtonConfig[] }>
  | Base<"custom_content", Heading & { image?: MediaRef; buttons: ButtonConfig[] }>
  | Base<"reels", Heading & { items: { video: string; poster?: MediaRef; title: Bilingual }[] }>;

export type SectionType = Section["section_type"];
export const sectionTypes: SectionType[] = [
  "hero", "text_image", "services_grid", "projects_grid", "video_showcase", "statistics",
  "testimonials", "faq", "logo_wall", "process_timeline", "cta", "custom_content", "reels",
];
