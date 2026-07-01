import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Slotnest.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Acceptance of terms",
    body: [
      "By creating an account or using Slotnest, you agree to these terms. If you're using the service on behalf of a business, you confirm you're authorized to bind that business to these terms.",
    ],
  },
  {
    heading: "Your account",
    body: [
      "You're responsible for keeping your login credentials secure and for all activity under your account. You must provide accurate information and keep it up to date. One subdomain is allocated per business and must not impersonate another brand.",
    ],
  },
  {
    heading: "Acceptable use",
    body: ["You agree not to misuse the service. In particular, you will not:"],
    bullets: [
      "Use Slotnest for unlawful, deceptive, or harmful purposes.",
      "Send spam or contact people who haven't agreed to hear from you.",
      "Attempt to bypass plan limits, rate limits, or security controls.",
      "Resell or sublicense the service without written permission.",
    ],
  },
  {
    heading: "Trial, plans, billing & cancellation",
    body: [
      "New accounts include a 7-day free trial with full access — no card required. After the trial you must choose a paid plan to keep taking bookings.",
      "Paid plans are priced in Indian Rupees (₹) and can be billed monthly or annually; prices shown exclude 18% GST. Your subscription runs for the period you pay for and is activated by our team. If a plan lapses without renewal, the account is paused until you subscribe again. You may cancel at any time; a cancellation stops future renewals and takes effect at the end of the current paid period.",
    ],
  },
  {
    heading: "Your content",
    body: [
      "You retain ownership of the content you add — your services, website copy, and client records. You grant us the limited rights needed to host and display it as part of providing the service.",
    ],
  },
  {
    heading: "Availability & changes",
    body: [
      "We work hard to keep Slotnest available but don't guarantee uninterrupted service. We may update features, these terms, or our plans; material changes will be communicated, and continued use means you accept the updated terms.",
    ],
  },
  {
    heading: "Disclaimer & liability",
    body: [
      "The service is provided \"as is\" without warranties of any kind. To the maximum extent permitted by law, Slotnest is not liable for indirect or consequential damages, and our total liability is limited to the amount you paid in the prior three months.",
    ],
  },
  {
    heading: "Contact",
    body: ["Questions about these terms? Get in touch via the contact page."],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The ground rules for using Slotnest, written to be readable rather than impenetrable."
      updated="June 30, 2026"
      sections={SECTIONS}
    />
  );
}
