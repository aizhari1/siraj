import { SectionRender } from "@/components/sections/render";
import { World } from "@/components/world/world";
import { getLocale } from "@/lib/i18n/config";
import { getHomepageSections } from "@/lib/data";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  const locale = getLocale(loc);
  const sections = await getHomepageSections(locale);

  return (
    <>
      <World />
      <SectionRender sections={sections} locale={locale} />
    </>
  );
}
