import type { SectionType, WorldConfig } from "@/types/content";
import type { FieldSpec } from "@/lib/spec/types";

const heading: FieldSpec[] = [
  { kind: "bi", key: "eyebrow", label: "Small label above the heading" },
  { kind: "bi", key: "heading", label: "Heading" },
  { kind: "bi", key: "body", label: "Text", long: true },
];
const buttons: FieldSpec = { kind: "buttons", key: "buttons", label: "Buttons" };

export type SectionDef = { label: string; description: string; fields: FieldSpec[]; world: Partial<WorldConfig> };

const BASE: Omit<Record<SectionType, SectionDef>, "reels"> = {
  hero: {
    label: "Hero", description: "Opening screen with headline, buttons and a hero image or video.",
    world: { background_type: "aurora", intensity: 0.45, motion_preset: "flow" },
    fields: [...heading, buttons,
      { kind: "media", key: "media", label: "Hero image", folder: "sections" },
      { kind: "video", key: "video_url", label: "Hero video", folder: "sections" }],
  },
  text_image: {
    label: "Text & Image", description: "Text beside an image. Good for the introduction.",
    world: { background_type: "none" },
    fields: [...heading, { kind: "media", key: "image", label: "Image", folder: "sections" }, buttons],
  },
  services_grid: {
    label: "Services Grid", description: "Shows your published services as cards.",
    world: { background_type: "none" },
    fields: [...heading, { kind: "number", key: "limit", label: "Max services to show (0 = all)", min: 0, max: 24 }],
  },
  projects_grid: {
    label: "Projects Grid", description: "Shows published projects, optionally only featured ones.",
    world: { background_type: "none" },
    fields: [...heading, { kind: "bool", key: "only_featured", label: "Only featured projects", default: true },
      { kind: "number", key: "limit", label: "Max projects to show (0 = all)", min: 0, max: 24 }],
  },
  video_showcase: {
    label: "Video Showcase", description: "A large video with heading.",
    world: { background_type: "aurora", intensity: 0.4 },
    fields: [...heading, { kind: "video", key: "video_url", label: "Video", folder: "sections" },
      { kind: "media", key: "poster", label: "Poster image", folder: "sections" }],
  },
  statistics: {
    label: "Statistics", description: "Animated counters, for example years, projects, clients.",
    world: { background_type: "none" },
    fields: [...heading, { kind: "items", key: "items", label: "Statistics", itemLabel: "Statistic", max: 8, fields: [
      { kind: "text", key: "value", label: "Value (e.g. 120+)", ltr: true },
      { kind: "bi", key: "label", label: "Label" }] }],
  },
  testimonials: {
    label: "Testimonials", description: "Shows published testimonials.",
    world: { background_type: "none" },
    fields: [...heading, { kind: "number", key: "limit", label: "Max testimonials (0 = all)", min: 0, max: 24 }],
  },
  faq: {
    label: "FAQ", description: "Questions and answers.",
    world: { background_type: "none" },
    fields: [...heading, { kind: "items", key: "items", label: "Questions", itemLabel: "Question", max: 30, fields: [
      { kind: "bi", key: "q", label: "Question" }, { kind: "bi", key: "a", label: "Answer", long: true }] }],
  },
  logo_wall: {
    label: "Logo Wall", description: "A wall of client or partner logos.",
    world: { background_type: "none" },
    fields: [...heading, { kind: "medialist", key: "logos", label: "Logos", folder: "sections" }],
  },
  process_timeline: {
    label: "Process Timeline", description: "Numbered steps of how you work.",
    world: { background_type: "none" },
    fields: [...heading, { kind: "items", key: "steps", label: "Steps", itemLabel: "Step", max: 10, fields: [
      { kind: "bi", key: "title", label: "Step title" }, { kind: "bi", key: "body", label: "Description", long: true }] }],
  },
  cta: {
    label: "Call to Action", description: "Closing section that pushes visitors to contact you.",
    world: { background_type: "none" },
    fields: [...heading, buttons],
  },
  custom_content: {
    label: "Custom Content", description: "Free heading, text, image and buttons. Use for Industries or anything else.",
    world: { background_type: "aurora", intensity: 0.4 },
    fields: [...heading, { kind: "media", key: "image", label: "Image", folder: "sections" }, buttons],
  },
};

export const SECTION_CATALOG: Record<SectionType, SectionDef> = {
  ...BASE,
  reels: {
  label: "Reels & Showreel", description: "Vertical video cards that play silently and open full-size when tapped.",
  world: { background_type: "none" },
  fields: [...heading, { kind: "items", key: "items", label: "Videos", itemLabel: "Video", max: 12, fields: [
    { kind: "video", key: "video", label: "Video (upload or link)", folder: "sections" },
    { kind: "media", key: "poster", label: "Cover image (shown before it plays)", folder: "sections" },
    { kind: "bi", key: "title", label: "Title" }] }],
},
};

const opt = (...v: string[]) => v.map((x) => ({ value: x, label: x }));

/** Settings shared by every section type. */
export const SECTION_SETTINGS: FieldSpec[] = [
  { kind: "group", key: "world", label: "World (animated background)", fields: [
    { kind: "select", key: "background_type", label: "Background", options: opt("none", "particles", "aurora", "code-rain", "waves", "morph", "scene-3d", "video") },
    { kind: "number", key: "intensity", label: "Intensity (0 to 1)", min: 0, max: 1, step: 0.05, default: 0.6 },
    { kind: "color", key: "color_accent", label: "Accent color", default: "#8B5CF6" },
    { kind: "select", key: "motion_preset", label: "Motion", options: opt("flow", "calm", "energetic") },
    { kind: "bool", key: "parallax", label: "Parallax on scroll", default: true },
  ] },
  { kind: "select", key: "layout", label: "Layout", options: opt("default", "reverse", "centered", "split") },
  { kind: "group", key: "background", label: "Section background", fields: [
    { kind: "select", key: "kind", label: "Type", options: opt("solid", "gradient", "image", "video") },
    { kind: "text", key: "value", label: "Value (color, image path or video link)", ltr: true },
  ] },
  { kind: "group", key: "visibility", label: "Visibility", fields: [
    { kind: "bool", key: "desktop", label: "Show on desktop", default: true },
    { kind: "bool", key: "mobile", label: "Show on mobile", default: true },
  ] },
];
