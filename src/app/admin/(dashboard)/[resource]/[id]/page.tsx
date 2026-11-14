import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isResourceKey, resources } from "@/lib/admin/resources";
import { RecordForm } from "@/components/admin/record-form";

export default async function EditPage({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource: key, id } = await params;
  if (!isResourceKey(key) || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const res = resources[key];
  const { data } = await supabase.from(res.table).select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">Edit {res.singular}</h1>
      <RecordForm resource={res} id={id} initial={data as Record<string, unknown>} />
    </div>
  );
}
