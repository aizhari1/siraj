import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/ui";
import { getProjects, getSections, getServices, getTestimonials } from "@/lib/data";
import { RenderSection } from "@/components/sections/render";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ui = t(locale);

  const sections = await getSections();
  const types = new Set(sections.data.map((s) => s.section_type));
  const [services, projects, testimonials] = await Promise.all([
    types.has("services_grid") ? getServices() : { data: [], error: false },
    types.has("projects_grid") ? getProjects() : { data: [], error: false },
    types.has("testimonials") ? getTestimonials() : { data: [], error: false },
  ]);

  if (sections.error) return <div className="grid min-h-[70svh] place-items-center px-5 pt-16 text-center text-muted"><p role="alert">{ui.error}</p></div>;
  if (sections.data.length === 0) return <div className="grid min-h-[70svh] place-items-center px-5 pt-16 text-center text-muted"><p>{ui.empty}</p></div>;

  return (
    <div className="pt-16">
      {sections.data.map((section) => (
        <RenderSection key={section.id} section={section} locale={locale} data={{ services: services.data, projects: projects.data, testimonials: testimonials.data }} />
      ))}
    </div>
  );
}
