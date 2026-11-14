import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { field, s, type Row } from "@/lib/data";
import type { ServiceItem } from "./service-grid";

export const toServiceItems = (rows: Row[], locale: Locale): ServiceItem[] =>
  rows.map((r) => ({ id: r.id, href: `/${locale}/services/${s(r.slug)}`, title: field(r, "title", locale), description: field(r, "description", locale), icon: s(r.icon), cta: t(locale).viewService }));
