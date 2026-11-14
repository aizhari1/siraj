"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitInquiry(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const locale = String(formData.get("locale") || "ar");

  if (!name || !email || !message) {
    return { ok: false, error: "missing_fields" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    name,
    email,
    message,
    locale,
  });

  if (error) {
    console.error(error);
    return { ok: false, error: "db_error" };
  }

  revalidatePath("/admin/inquiries");
  return { ok: true };
}
