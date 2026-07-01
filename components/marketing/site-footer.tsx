import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Get started", href: "/signup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Testimonials", href: "/#testimonials" },
      { label: "Industries", href: "/#industries" },
      { label: "Log in", href: "/login" },
      { label: "Book a call", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative">
      <div aria-hidden className="hairline absolute inset-x-0 top-0" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="text-lg font-semibold tracking-tight text-white">Slotnest</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
            The AI receptionist that books appointments around the clock — for 40+
            industries, with a website builder included.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {col.title}
            </div>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-400 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-gray-500 sm:flex-row sm:px-8">
        <div aria-hidden className="hairline absolute inset-x-5 top-0 sm:inset-x-8" />
        <span>© {new Date().getFullYear()} Slotnest. All rights reserved.</span>
        <span className="text-gray-600">Made in India 🇮🇳</span>
      </div>
    </footer>
  );
}
