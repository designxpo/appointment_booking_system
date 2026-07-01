"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./logo";

// Absolute "/#anchor" so the links resolve from any page, not just home.
const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#testimonials", label: "Testimonials" },
];

/**
 * Sticky marketing nav. Gains a frosted background once the hero scrolls past,
 * and collapses to a slide-down sheet on mobile.
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-ink/70 backdrop-blur-xl" : ""
      }`}
    >
      {scrolled && (
        <div aria-hidden className="hairline absolute inset-x-0 bottom-0" />
      )}
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Slotnest home">
          <Logo className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-tight text-white">Slotnest</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="px-3 py-2 text-sm text-gray-300 transition-colors hover:text-white">
            Log in
          </Link>
          <Link href="/signup" className="btn-gradient text-sm">
            Get Started
            <Arrow />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-200 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="relative bg-ink/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <div aria-hidden className="hairline absolute inset-x-0 top-0" />
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.06] pt-3">
            <Link href="/login" className="btn-outline w-full justify-center text-sm">
              Log in
            </Link>
            <Link href="/signup" className="btn-gradient w-full justify-center text-sm">
              Get Started <Arrow />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
