export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export const isLocale = (v: string): v is Locale =>
  (locales as readonly string[]).includes(v);

export const dirOf = (l: Locale): "rtl" | "ltr" => (l === "ar" ? "rtl" : "ltr");

/** Pick the AR or EN column of a bilingual record, falling back to the other language. */
export function pick<T extends Record<string, unknown>>(
  row: T,
  base: string,
  locale: Locale,
): string {
  const primary = row[`${base}_${locale}`];
  const other = row[`${base}_${locale === "ar" ? "en" : "ar"}`];
  return (typeof primary === "string" && primary) || (typeof other === "string" ? other : "");
}
