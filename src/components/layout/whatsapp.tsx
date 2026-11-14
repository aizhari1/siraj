import { MessageCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { asObject, s } from "@/lib/data";

export function WhatsAppButton({ locale, settings }: { locale: Locale; settings: Record<string, Record<string, unknown>> }) {
  const w = asObject(settings["contact.whatsapp"]);
  const number = s(w.number).replace(/\D/g, "");
  if (!w.enabled || !number) return null;
  const msg = s(w[`message_${locale}`]);
  const href = `https://wa.me/${number}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={t(locale).whatsapp}
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+96px)] end-4 z-40 md:bottom-6 md:end-6 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition hover:scale-105">
      <MessageCircle className="size-7" aria-hidden />
    </a>
  );
}
