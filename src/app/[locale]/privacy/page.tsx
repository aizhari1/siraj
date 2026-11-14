import { TextPage } from "@/components/layout/text-page";
import { getLocale } from "@/lib/i18n/config";
import { ui } from "@/lib/i18n/ui";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  const locale = getLocale(loc);
  const t = ui[locale];

  return (
    <TextPage
      title={t.privacy.title}
      body={t.privacy.body}
      locale={locale}
    />
  );
}
