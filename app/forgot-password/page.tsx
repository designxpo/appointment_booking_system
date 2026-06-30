"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/action/auth";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    setMessage(null);
    const res = await requestPasswordReset(formData);
    setPending(false);
    if (res?.error) setError(res.error);
    else if (res?.message) setMessage(res.message);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p className="mt-1 text-sm text-gray-500">We&apos;ll email you a reset link.</p>
      <form action={action} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        <Link href="/login" className="text-brand">
          Back to log in
        </Link>
      </p>
    </main>
  );
}
