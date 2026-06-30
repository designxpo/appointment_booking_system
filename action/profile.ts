"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation";

/** Owner action: update profile display fields (Profile page). */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    businessName: formData.get("businessName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      business_name: parsed.data.businessName,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  return { ok: true };
}
