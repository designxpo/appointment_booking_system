"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { serviceSchema, updateServiceSchema } from "@/lib/validation";

/** Owner action: edit an existing service. RLS scopes the row to the owner. */
export async function updateService(raw: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = updateServiceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  const { error } = await supabase
    .from("services")
    .update({
      name: d.name,
      duration_minutes: d.durationMinutes,
      price: d.price ?? null,
      buffer_minutes: d.bufferMinutes,
      capacity: d.capacity,
    })
    .eq("id", d.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/services");
  return { ok: true };
}

/** Owner CRUD for services/treatments/listings. RLS scopes all rows to the owner. */

export async function createService(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price") || null,
    bufferMinutes: formData.get("bufferMinutes") || 0,
    capacity: formData.get("capacity") || 1,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase.from("services").insert({
    clinic_id: user.id,
    name: parsed.data.name,
    duration_minutes: parsed.data.durationMinutes,
    price: parsed.data.price ?? null,
    buffer_minutes: parsed.data.bufferMinutes,
    capacity: parsed.data.capacity,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/services");
  return { ok: true };
}

export async function setServiceActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/services");
  return { ok: true };
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/services");
  return { ok: true };
}
