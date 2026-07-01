import Link from "next/link";
import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Book a Call",
  description:
    "Talk to the Slotnest team about automating your bookings, or start your free trial in minutes.",
};

const POINTS = [
  { title: "See it on your business", body: "We'll show how the AI receptionist handles your specific services and industry." },
  { title: "Migration help", body: "Moving from another tool? We'll help you get set up and import your details." },
  { title: "Pricing & plans", body: "Get a recommendation for the right plan based on your booking volume." },
];

export default function ContactPage() {
  return (
    <MarketingShell>
      <section className="px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge-pill">Book a Call</span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Let&apos;s get you booking on autopilot
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-gray-400">
            Tell us about your business and we&apos;ll show you how Slotnest can
            run your front desk. Prefer to dive in? Start your 7-day free trial right now.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Left: value + quick start */}
          <div className="flex flex-col gap-6">
            <div className="space-y-5">
              {POINTS.map((p) => (
                <div key={p.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">{p.title}</div>
                    <div className="mt-1 text-sm leading-relaxed text-gray-400">{p.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-brand/20 bg-gradient-to-b from-brand/10 to-transparent p-6">
              <div className="text-sm font-semibold text-white">Rather not wait?</div>
              <p className="mt-1 text-sm text-gray-400">
                Create your account and have your AI receptionist live in minutes — free for 7 days.
              </p>
              <Link href="/signup" className="btn-gradient mt-4 w-full justify-center">
                Start free trial
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: working form */}
          <ContactForm />
        </div>
      </section>
    </MarketingShell>
  );
}
