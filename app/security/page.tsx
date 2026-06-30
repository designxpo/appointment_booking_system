import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Security",
  description: "How Slotnest keeps your data and your clients' bookings safe.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Tenant isolation",
    body: [
      "Every business's data is isolated at the database layer with Postgres Row-Level Security. Owners can only read and write rows belonging to their own business, enforced by the database itself — not just the application.",
    ],
  },
  {
    heading: "Authentication",
    body: [
      "Accounts are managed through Supabase Auth with secure, http-only session cookies. Dashboard routes are guarded server-side, and sensitive operations run with carefully scoped service credentials that never reach the browser.",
    ],
  },
  {
    heading: "Booking integrity",
    body: [
      "Bookings are protected against double-booking with a per-business lock that serializes concurrent writes and honors each service's seat capacity, so two clients can never claim the same slot.",
    ],
  },
  {
    heading: "Payments",
    body: [
      "Subscriptions are paid on-chain, wallet-to-wallet. We never hold your private keys. Each upgrade is bound to a unique payment amount and verified on-chain, and every transaction hash can be used exactly once — making replays impossible.",
    ],
  },
  {
    heading: "Abuse prevention",
    body: ["We apply layered safeguards to keep the platform healthy:"],
    bullets: [
      "Rate limiting on public endpoints, including a per-business cost backstop.",
      "Input validation on every form and API boundary.",
      "Output escaping to prevent injection in emails and pages.",
      "Reserved subdomains and strict subdomain validation.",
    ],
  },
  {
    heading: "Reporting a vulnerability",
    body: [
      "Found something? We appreciate responsible disclosure. Please reach out through the contact page with details, and give us a reasonable window to investigate and fix before any public disclosure.",
    ],
  },
];

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      intro="Security isn't a bolt-on. Here's how Slotnest protects your account, your bookings, and your clients."
      updated="June 30, 2026"
      sections={SECTIONS}
    />
  );
}
