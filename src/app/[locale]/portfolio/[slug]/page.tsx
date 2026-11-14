import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n/config";
import { getProject } from "@/lib/data";
import { Media } from "@/components/ui/media";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: loc, slug } = await params;
  const locale = getLocale(loc);
  const project = await getProject(slug, locale);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold">{project.title}</h1>
      {project.cover && (
        <div className="mb-8 overflow-hidden rounded-2xl">
          <Media src={project.cover} alt={project.title} className="w-full" />
        </div>
      )}
      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: project.body || "" }} />
    </article>
  );
}
