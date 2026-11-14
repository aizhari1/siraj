"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function setInquiryStatus(id: string, status: "new" | "read" | "replied" | "archived") {
  const { supabase } = await requireAdmin();
  await supabase.from("inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/inquiries");
}
export async function deleteInquiry(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("inquiries").delete().eq("id", id);
  revalidatePath("/admin/inquiries");
}
