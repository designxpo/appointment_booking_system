"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEV_MOCK } from "@/lib/env";

/**
 * Auth server actions.
 *
 * Email verification is disabled for now: signup creates the account already
 * confirmed (via the service-role admin API), signs the user straight in, and
 * sends them to onboarding. This works regardless of the project's "Confirm
 * email" setting. To re-enable verification later, switch signUp back to
 * `supabase.auth.signUp({ ... emailRedirectTo })` and turn the toggle on.
 *
 * In DEV_MOCK mode there is no Supabase backend, so every action short-circuits
 * to the mocked dashboard/landing instead of calling auth (which would fail
 * against placeholder credentials). This lets you click through the whole
 * product locally with no backend configured.
 */

export async function signUp(formData: FormData) {
  // In mock mode there is no backend — drop the user straight into onboarding
  // so the industry-tailoring flow is part of the demo.
  if (DEV_MOCK) redirect("/onboarding");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }

  // Create the user already email-confirmed so no verification step is needed.
  const admin = createAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    const exists = /already|registered|exists/i.test(createError.message);
    return {
      error: exists
        ? "An account with that email already exists. Log in instead."
        : createError.message,
    };
  }

  // Establish the session via the cookie-based client, then go to onboarding.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { error: signInError.message };

  redirect("/onboarding");
}

export async function signIn(formData: FormData) {
  if (DEV_MOCK) redirect("/dashboard");

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function signOut() {
  if (DEV_MOCK) redirect("/");

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resendVerification(formData: FormData) {
  if (DEV_MOCK) return { ok: true, message: "Verification email sent." };

  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
  });
  if (error) return { error: error.message };
  return { ok: true, message: "Verification email sent." };
}

export async function requestPasswordReset(formData: FormData) {
  if (DEV_MOCK) {
    return { ok: true, message: "If that email exists, a reset link is on its way." };
  }

  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: error.message };
  return { ok: true, message: "If that email exists, a reset link is on its way." };
}

export async function updatePassword(formData: FormData) {
  if (DEV_MOCK) redirect("/dashboard");

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Reset link expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}
