import type { FieldSpec } from "@/lib/spec/types";

export type SettingDef = { key: string; title: string; fields: FieldSpec[] };

const colors = ["background", "surface", "card", "purple", "purple_light", "muted"];
const socials = ["facebook", "instagram", "linkedin", "tiktok", "x", "youtube"];

export const SETTINGS_CATALOG: SettingDef[] = [
  { key: "brand.logo", title: "Logo", fields: [{ kind: "image", key: "url", label: "Logo image", folder: "branding" }] },
  { key: "brand.favicon", title: "Favicon", fields: [{ kind: "image", key: "url", label: "Favicon (PNG, ICO)", folder: "branding" }] },
  { key: "brand.colors", title: "Brand colors", fields: colors.map((c) => ({ kind: "color" as const, key: c, label: c.replace("_", " "), default: "#000000" })) },
  { key: "contact.whatsapp", title: "WhatsApp button", fields: [
    { kind: "bool", key: "enabled", label: "Show the floating WhatsApp button" },
    { kind: "text", key: "number", label: "Number with country code, e.g. 201001234567", ltr: true },
    { kind: "text", key: "message_ar", label: "Default message (Arabic)" },
    { kind: "text", key: "message_en", label: "Default message (English)", ltr: true },
  ] },
  { key: "contact.email", title: "Email", fields: [{ kind: "text", key: "value", label: "Contact email", ltr: true }] },
  { key: "contact.phone", title: "Phone", fields: [{ kind: "text", key: "value", label: "Phone number", ltr: true }] },
  { key: "contact.address", title: "Address", fields: [{ kind: "bi", key: "address", label: "Address" }] },
  { key: "social.links", title: "Social media", fields: socials.map((s) => ({ kind: "text" as const, key: s, label: `${s} URL`, ltr: true })) },
  { key: "footer.content", title: "Footer", fields: [
    { kind: "bi", key: "about", label: "About text", long: true }, { kind: "bi", key: "copyright", label: "Copyright line" }] },
  { key: "page.about", title: "About page", fields: [
    { kind: "bi", key: "title", label: "Page title" }, { kind: "bi", key: "body", label: "Text (blank line between paragraphs)", long: true },
    { kind: "image", key: "image", label: "Image", folder: "branding" }] },
  { key: "page.privacy", title: "Privacy Policy page", fields: [
    { kind: "bi", key: "title", label: "Page title" }, { kind: "bi", key: "body", label: "Text (blank line between paragraphs)", long: true }] },
  { key: "seo.defaults", title: "Default SEO", fields: [
    { kind: "bi", key: "title", label: "Site title" }, { kind: "bi", key: "description", label: "Site description", long: true },
    { kind: "image", key: "og_image", label: "Share image (1200×630)", folder: "branding" }] },
];
