"use server";
import { z } from "zod";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { createPublicClient } from "@/lib/supabase/public";

export type ContactState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> } | null;

export async function submitInquiry(_prev: ContactState, fd: FormData): Promise<ContactState> {
  const loc = String(fd.get("_locale") ?? "ar");
  const locale: Locale = isLocale(loc) ? loc : "ar";
  const ui = t(locale);

  const raw = Object.fromEntries(["name", "company", "country", "email", "whatsapp", "service", "budget", "details"].map((k) => [k, String(fd.get(k) ?? "").trim()]));

  // Honeypot: bots fill the hidden field. Pretend success and store nothing.
  if (String(fd.get("website") ?? "")) return { ok: true };

  const schema = z.object({
    name: z.string().min(1, ui.required).max(160),
    company: z.string().max(160),
    country: z.string().max(80),
    email: z.string().min(1, ui.required).max(254).regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, ui.invalidEmail),
    whatsapp: z.string().refine((v) => v === "" || /^\+?[0-9 ()-]{6,24}$/.test(v), ui.invalidPhone),
    service: z.string().max(160),
    budget: z.string().max(80),
    details: z.string().min(10, ui.tooShort).max(5000),
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { fieldErrors, values: raw };
  }

  const v = parsed.data;
  const { error } = await createPublicClient().from("inquiries").insert({
    name: v.name, company: v.company || null, country: v.country || null, email: v.email,
    whatsapp: v.whatsapp || null, service: v.service || null, budget: v.budget || null, details: v.details,
  });
  if (error) return { error: ui.submitError, values: raw };
  return { ok: true };
}
