"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEV_MOCK } from "@/lib/env";

/**
 * Auth server actions. Signup uses email verification — the user must confirm
 * before they can complete onboarding (gate enforced in the dashboard layout).
 *
 * In DEV_MOCK mode there is no Supabase backend, so every action short-circuits
 * to the mocked dashboard/landing instead of calling auth (which would fail
 * against placeholder credentials). This lets you click through the whole
 * product locally with no backend configured.
 */

export async function signUp(formData: FormData) {
  // In mock mode skip email verification and drop the user straight into
  // onboarding, so the industry-tailoring flow is part of the demo.
  if (DEV_MOCK) redirect("/onboarding");

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  return { ok: true, message: "Check your email to verify your account." };
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
