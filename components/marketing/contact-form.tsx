"use client";

import { useState } from "react";
import { sendContactMessage } from "@/action/contact";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await sendContactMessage(formData);
    setPending(false);
    if ("error" in res) setError(res.error);
    else setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Message sent</h3>
        <p className="mt-2 text-sm text-gray-400">
          Thanks for reaching out — we&apos;ll get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-white/[0.05] bg-white/[0.03] p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Your name" required>
          <input id="name" name="name" type="text" required maxLength={100} className="input" placeholder="Jane Smith" />
        </Field>
        <Field id="email" label="Work email" required>
          <input id="email" name="email" type="email" required maxLength={200} className="input" placeholder="jane@business.com" />
        </Field>
      </div>
      <Field id="business" label="Business name">
        <input id="business" name="business" type="text" maxLength={120} className="input" placeholder="Bright Smile Dental" />
      </Field>
      <Field id="message" label="How can we help?" required>
        <textarea id="message" name="message" required minLength={10} maxLength={4000} rows={5} className="input resize-none" placeholder="Tell us about your business and what you'd like to automate…" />
      </Field>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-gradient w-full justify-center disabled:opacity-60">
        {pending ? "Sending…" : "Send message"}
      </button>
      <p className="text-center text-xs text-gray-500">
        We&apos;ll only use your details to reply. No spam, ever.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      {children}
    </div>
  );
}
