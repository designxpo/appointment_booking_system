"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createLeadSchema, leadStatusSchema } from "@/lib/validation";

/** Owner action: manually add a client/lead (walk-ins, phone bookings). */
export async function createLead(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = createLeadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  if (!d.email && !d.phone) {
    return { error: "Add an email or a phone number." };
  }

  const { error } = await supabase.from("leads").insert({
    clinic_id: user.id,
    name: d.name,
    email: d.email || null,
    phone: d.phone || null,
    source: "manual",
    status: "new",
    notes: d.notes || null,
  });
  if (error) {
    if (error.code === "23505") return { error: "A client with that email already exists." };
    return { error: error.message };
  }
  revalidatePath("/dashboard/clients");
  return { ok: true };
}

/** Owner action: update a lead's pipeline status from the CRM. */
export async function updateLeadStatus(id: string, status: string) {
  const supabase = await createClient();
  const parsed = leadStatusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const { error } = await supabase
    .from("leads")
    .update({ status: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id); // RLS scopes to owner

  if (error) return { error: error.message };
  revalidatePath("/dashboard/clients");
  return { ok: true };
}
