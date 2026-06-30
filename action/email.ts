import "server-only";

import { Resend } from "resend";
import { appUrl } from "@/lib/env";

/**
 * Transactional email via Resend.
 *
 * Deliberately NOT a "use server" module: server actions are public RPC
 * endpoints, and an email sender taking caller-supplied recipients would be an
 * open mail relay. These are plain server functions, importable only from
 * trusted server code (the "server-only" import enforces that at build time).
 */

let _resend: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null; // email is optional in dev
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

const FROM = () => process.env.RESEND_FROM_EMAIL || "bookings@flowbook.ai";

function manageBlock(token: string | undefined): string {
  if (!token) return "";
  const url = `${appUrl()}/manage/${token}`;
  return `<p style="margin-top:16px">
      Need to change plans?
      <a href="${url}" style="color:#4f46e5">Reschedule or cancel online</a>.
    </p>`;
}

export interface ConfirmationArgs {
  to: string;
  clientName: string;
  businessName: string;
  serviceName: string;
  startsAt: string; // ISO
  manageToken?: string;
}

function whenStr(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export async function sendConfirmationEmail(args: ConfirmationArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY unset — skipping confirmation email");
    return { skipped: true };
  }

  const { error } = await resend.emails.send({
    from: FROM(),
    to: args.to,
    subject: `Your appointment with ${args.businessName} is confirmed`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto">
        <h2>You're booked, ${escapeHtml(args.clientName)}! ✅</h2>
        <p>Your <strong>${escapeHtml(args.serviceName)}</strong> with
           <strong>${escapeHtml(args.businessName)}</strong> is confirmed for:</p>
        <p style="font-size:18px"><strong>${whenStr(args.startsAt)}</strong></p>
        ${manageBlock(args.manageToken)}
      </div>`,
  });

  if (error) return { error: error.message };
  return { ok: true };
}

export async function sendReminderEmail(args: ConfirmationArgs) {
  const resend = getResend();
  if (!resend) return { skipped: true };
  const { error } = await resend.emails.send({
    from: FROM(),
    to: args.to,
    subject: `Reminder: your appointment with ${args.businessName} is tomorrow`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto">
        <h2>See you soon, ${escapeHtml(args.clientName)}! 👋</h2>
        <p>A reminder that your <strong>${escapeHtml(args.serviceName)}</strong> with
           <strong>${escapeHtml(args.businessName)}</strong> is coming up:</p>
        <p style="font-size:18px"><strong>${whenStr(args.startsAt)}</strong></p>
        ${manageBlock(args.manageToken)}
      </div>`,
  });
  return error ? { error: error.message } : { ok: true };
}

export async function sendCancellationEmail(args: ConfirmationArgs) {
  const resend = getResend();
  if (!resend) return { skipped: true };
  const { error } = await resend.emails.send({
    from: FROM(),
    to: args.to,
    subject: `Your appointment with ${args.businessName} was cancelled`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto">
        <h2>Appointment cancelled</h2>
        <p>Hi ${escapeHtml(args.clientName)}, your <strong>${escapeHtml(args.serviceName)}</strong>
           with <strong>${escapeHtml(args.businessName)}</strong> on
           <strong>${whenStr(args.startsAt)}</strong> has been cancelled.</p>
        <p>Want to rebook? Just reply or visit us again anytime.</p>
      </div>`,
  });
  return error ? { error: error.message } : { ok: true };
}

export interface OwnerNotifyArgs {
  to: string;
  businessName: string;
  clientName: string;
  serviceName: string;
  startsAt: string;
}

export async function sendOwnerNotification(args: OwnerNotifyArgs) {
  const resend = getResend();
  if (!resend) return { skipped: true };
  const when = new Date(args.startsAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const { error } = await resend.emails.send({
    from: FROM(),
    to: args.to,
    subject: `New booking: ${args.clientName} — ${when}`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto">
        <h2>New booking 🎉</h2>
        <p><strong>${escapeHtml(args.clientName)}</strong> booked
           <strong>${escapeHtml(args.serviceName)}</strong> for <strong>${when}</strong>.</p>
        <p>View it in your FlowBookAI calendar.</p>
      </div>`,
  });
  return error ? { error: error.message } : { ok: true };
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
