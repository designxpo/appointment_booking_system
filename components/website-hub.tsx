"use client";

import Link from "next/link";
import { useState } from "react";
import { setPublished, setTheme } from "@/action/website";
import {
  IconGlobe,
  IconSparkle,
  IconCheck,
  IconCalendar,
  IconExternal,
} from "@/components/icons";
import type { Theme } from "@/lib/types";

const TEMPLATES: { id: Theme; name: string; desc: string; preview: string }[] = [
  {
    id: "modern",
    name: "Modern",
    desc: "Gradient hero, cards, bold typography — perfect for a contemporary feel.",
    preview: "from-violet-500 to-indigo-600",
  },
  {
    id: "classic",
    name: "Classic",
    desc: "Serif fonts, professional layout, trust-focused design.",
    preview: "from-blue-600 to-indigo-700",
  },
  {
    id: "minimum",
    name: "Minimum",
    desc: "Clean lines, generous whitespace, content-first. Understated elegance.",
    preview: "from-gray-600 to-gray-800",
  },
];

const HOSTING_FEATURES = [
  "Custom subdomain",
  "3 beautiful templates",
  "Visual editor",
  "Booking widget",
  "SEO-ready",
  "Mobile responsive",
  "Cancel anytime",
  "99.9% uptime",
];

export function WebsiteHub({
  subdomain,
  theme,
  isPublished,
  isPaid,
}: {
  subdomain: string;
  theme: Theme;
  isPublished: boolean;
  isPaid: boolean;
}) {
  const [active, setActive] = useState<Theme>(theme);
  const [published, setPub] = useState(isPublished);
  const [status, setStatus] = useState<string | null>(null);

  async function pickTemplate(t: Theme) {
    const prev = active;
    setActive(t);
    const res = await setTheme(t);
    if (res?.error) {
      setActive(prev);
      setStatus(res.error);
    }
  }

  async function togglePublish() {
    const next = !published;
    const res = await setPublished(next);
    if (res?.error) setStatus(res.error);
    else setPub(next);
  }

  return (
    <div className="space-y-6">
      {/* ── Publish status banner ─────────────────────────────── */}
      <section className="card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${published ? "bg-emerald-400" : "bg-gray-600"}`}
          />
          <div>
            <div className="font-semibold text-white">
              Website is {published ? "Published" : "Unpublished"}
            </div>
            <div className="text-sm text-gray-500">
              {published
                ? `Live at /site/${subdomain}`
                : isPaid
                  ? "Publish to make your site visible to clients."
                  : "Upgrade to a paid plan to publish your website."}
            </div>
          </div>
        </div>
        {isPaid ? (
          <button onClick={togglePublish} className="btn-primary">
            <IconSparkle className="h-4 w-4" />
            {published ? "Unpublish" : "Publish Website"}
          </button>
        ) : (
          <Link href="/dashboard/billing" className="btn-primary">
            <IconSparkle className="h-4 w-4" /> Upgrade & Publish
          </Link>
        )}
      </section>
      {status && <p className="text-sm text-rose-400">{status}</p>}

      {/* ── Template gallery ──────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-white">Choose Template</h2>
        <p className="text-sm text-gray-500">
          You can switch templates at any time — your content is preserved.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {TEMPLATES.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => pickTemplate(t.id)}
                className={`overflow-hidden rounded-2xl border text-left transition-all ${
                  isActive
                    ? "border-emerald-400/70 shadow-glow"
                    : "border-ink-border hover:border-ink-soft"
                }`}
              >
                {/* Mini preview */}
                <div className={`relative h-40 bg-gradient-to-br p-4 ${t.preview}`}>
                  <div className="flex items-center justify-between">
                    <span className="h-2 w-8 rounded-full bg-white/40" />
                    <span className="flex gap-1">
                      <span className="h-2 w-6 rounded-full bg-white/30" />
                      <span className="h-2 w-6 rounded-full bg-white/30" />
                      <span className="h-2 w-8 rounded-full bg-white/50" />
                    </span>
                  </div>
                  <div className="mt-8 space-y-2">
                    <span className="block h-3 w-2/3 rounded-full bg-white/50" />
                    <span className="block h-2 w-1/2 rounded-full bg-white/30" />
                    <span className="block h-2 w-1/3 rounded-full bg-white/30" />
                  </div>
                  {isActive && (
                    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-ink">
                      <IconCheck className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <div className="bg-ink-raised p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-100">{t.name}</span>
                    {isActive && (
                      <span className="chip border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Hosting card ──────────────────────────────────────── */}
      <section className="card">
        <div className="flex items-start gap-4">
          <span className="page-icon shrink-0">
            <IconSparkle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white">
              Website Hosting — included in paid plans
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Publish your professional website with a custom subdomain. Clients can
              find you online, learn about your services, and book appointments
              directly from your site.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {HOSTING_FEATURES.map((f) => (
                <span key={f} className="flex items-center gap-2 text-sm text-gray-300">
                  <IconCheck className="h-4 w-4 shrink-0 text-emerald-400" /> {f}
                </span>
              ))}
            </div>
            {!isPaid && (
              <Link href="/dashboard/billing" className="btn-primary mt-5">
                <IconSparkle className="h-4 w-4" /> Upgrade to unlock
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          icon="✎"
          title="Edit Content"
          desc="Update text, images, and section layout."
          href="/dashboard/website/editor"
          linkLabel="Open Editor"
        />
        <ActionCard
          icon={<IconCalendar className="h-5 w-5" />}
          title="AI Booking Widget"
          desc="Configure the AI booking button on your site."
          href="/dashboard/ai"
          linkLabel="AI Settings"
        />
        <ActionCard
          icon={<IconGlobe className="h-5 w-5" />}
          title="Preview Website"
          desc="See how your website looks to visitors."
          href={`/site/${subdomain}`}
          linkLabel="Preview"
          external
        />
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  desc,
  href,
  linkLabel,
  external,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  linkLabel: string;
  external?: boolean;
}) {
  return (
    <div className="card">
      <span className="page-icon">{icon}</span>
      <h3 className="mt-3 font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
          {linkLabel} <IconExternal className="h-3.5 w-3.5" />
        </a>
      ) : (
        <Link href={href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
          {linkLabel} <IconExternal className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
