"use server";

import { z } from "zod";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Marketing "Book a call" / contact form handler.
 *
 * Safe to expose as a server action: the recipient is a FIXED, server-side
 * address (CONTACT_EMAIL / RESEND_FROM_EMAIL) — never the caller's input — so
 * this can't be turned into an open mail relay. The visitor's email is only
 * used as the reply-to. Throttled per-email and globally to blunt spam.
 *
 * If email isn't configured (e.g. local dev with no RESEND_API_KEY) the
 * submission is logged and reported as sent, so the form still works to click
 * through — wire up RESEND_API_KEY + CONTACT_EMAIL for real delivery.
 */

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  business: z.string().trim().max(120).optional().default(""),
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more detail (at least 10 characters).")
    .max(4000),
});

export type ContactResult = { ok: true } | { error: string };

export async function sendContactMessage(formData: FormData): Promise<ContactResult> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    business: formData.get("business") ?? "",
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const { name, email, business, message } = parsed.data;

  // Throttle: a single email can send a few times, with a global backstop.
  const perEmail = rateLimit(`contact:${email.toLowerCase()}`, 3, 10 * 60_000);
  const global = rateLimit("contact:global", 60, 10 * 60_000);
  if (!perEmail.ok || !global.ok) {
    return { error: "You've sent a few messages already — please try again in a little while." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !to) {
    console.warn(
      "[contact] email not configured (RESEND_API_KEY / CONTACT_EMAIL) — message logged, not delivered:",
      { name, email, business },
    );
    return { ok: true };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "bookings@flowbook.ai",
    to,
    replyTo: email,
    subject: `New enquiry from ${name}${business ? ` — ${business}` : ""}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto">
        <h2 style="margin:0 0 12px">New FlowBookAI enquiry</h2>
        <p style="margin:4px 0"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:4px 0"><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${business ? `<p style="margin:4px 0"><strong>Business:</strong> ${escapeHtml(business)}</p>` : ""}
        <p style="margin:16px 0 4px"><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;margin:0;color:#374151">${escapeHtml(message)}</p>
      </div>`,
  });

  if (error) {
    return { error: "We couldn't send your message right now. Please email us directly." };
  }
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
