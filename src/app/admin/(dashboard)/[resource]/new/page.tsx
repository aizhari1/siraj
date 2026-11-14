import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isResourceKey, resources } from "@/lib/admin/resources";
import { RecordForm } from "@/components/admin/record-form";

export default async function NewPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource: key } = await params;
  if (!isResourceKey(key)) notFound();
  await requireAdmin();
  const res = resources[key];
  const initial: Record<string, unknown> = {};
  for (const f of res.fields) {
    initial[f.name] = f.type === "gallery" || f.type === "bilist" ? [] : f.type === "number" ? 0 : f.type === "boolean" ? false : f.name === "category" ? "general" : "";
  }
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">New {res.singular}</h1>
      <RecordForm resource={res} initial={initial} />
    </div>
  );
}
