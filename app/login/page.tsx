"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/action/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await signIn(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
    // success → server action redirects to /dashboard
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-gray-500">Log in to FlowBookAI.</p>
      <form action={action} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-3 text-center text-sm">
        <Link href="/forgot-password" className="text-gray-500 hover:text-brand">
          Forgot password?
        </Link>
      </p>
      <p className="mt-4 text-center text-sm text-gray-500">
        No account?{" "}
        <Link href="/signup" className="text-brand">
          Sign up
        </Link>
      </p>
    </main>
  );
}
