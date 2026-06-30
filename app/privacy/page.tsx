import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FlowBookAI collects, uses, and protects your data and your clients' data.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      "FlowBookAI provides AI-powered appointment booking software. This policy explains what information we process when you use our website, dashboard, and the booking sites we host on your behalf.",
    ],
  },
  {
    heading: "Information we collect",
    body: ["We collect the information needed to run your account and your bookings:"],
    bullets: [
      "Account details: your name, email, business name, industry, and chosen subdomain.",
      "Booking data: appointments, services, working hours, and the leads/clients you capture.",
      "Conversation data: messages exchanged with the AI receptionist to complete a booking.",
      "Billing data: on-chain payment references for crypto subscriptions (we never hold your wallet keys).",
      "Technical data: standard logs such as IP address and browser type, used for security and rate limiting.",
    ],
  },
  {
    heading: "How we use information",
    body: [
      "We use your data to operate the service: to authenticate you, calculate availability, book and remind clients, send transactional email, prevent abuse, and improve reliability. We do not sell your data.",
    ],
  },
  {
    heading: "AI processing",
    body: [
      "The AI receptionist is powered by the Anthropic Claude API. Booking conversations are sent to Anthropic solely to generate the assistant's replies and perform booking actions. We do not use your client conversations to train models.",
    ],
  },
  {
    heading: "Sub-processors",
    body: ["We rely on a small set of trusted providers to deliver the service:"],
    bullets: [
      "Supabase — database, authentication, and file storage.",
      "Anthropic — the AI receptionist language model.",
      "Resend — transactional email delivery.",
    ],
  },
  {
    heading: "Data retention & your rights",
    body: [
      "We retain account and booking data for as long as your account is active. You can export or delete your data from the dashboard, or by contacting us. Depending on your location, you may have rights to access, correct, or erase your personal data.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about this policy or your data? Reach us through the contact page and we'll respond promptly.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Your trust matters. Here's a plain-language summary of what data FlowBookAI processes and why."
      updated="June 30, 2026"
      sections={SECTIONS}
    />
  );
}
