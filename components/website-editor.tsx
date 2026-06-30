"use client";

import { useState } from "react";
import { saveWebsite } from "@/action/website";
import { createClient } from "@/lib/supabase/client";
import { IconCheck } from "@/components/icons";
import type { SiteSections, WebsiteData } from "@/lib/types";

const MAX_GALLERY = 12;

type SectionKey = keyof SiteSections;

const SECTION_META: { key: SectionKey; label: string; icon: string }[] = [
  { key: "hero", label: "Hero", icon: "🖼" },
  { key: "about", label: "About", icon: "👤" },
  { key: "services", label: "Services", icon: "🏷" },
  { key: "stats", label: "Stats", icon: "📊" },
  { key: "reviews", label: "Reviews", icon: "⭐" },
  { key: "faq", label: "FAQ", icon: "❓" },
  { key: "gallery", label: "Gallery", icon: "🖼" },
  { key: "contact", label: "Contact", icon: "📞" },
  { key: "cta", label: "CTA", icon: "📣" },
];

export function WebsiteEditor({
  clinicId,
  subdomain,
  initial,
  locked,
}: {
  clinicId: string;
  subdomain: string;
  initial: WebsiteData;
  locked: boolean;
}) {
  const [d, setD] = useState(initial);
  const [section, setSection] = useState<SectionKey>("hero");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Live preview = the REAL site rendered in an iframe; bump to reload after save.
  const [previewKey, setPreviewKey] = useState(0);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  function set<K extends keyof WebsiteData>(key: K, value: WebsiteData[K]) {
    setD((p) => ({ ...p, [key]: value }));
  }
  function toggleSection(key: SectionKey, visible: boolean) {
    set("sections", { ...d.sections, [key]: visible });
  }

  async function uploadTo(file: File): Promise<string | null> {
    const supabase = createClient();
    const path = `${clinicId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("website-images")
      .upload(path, file, { upsert: true });
    if (error) {
      setStatus(error.message);
      return null;
    }
    return supabase.storage.from("website-images").getPublicUrl(path).data.publicUrl;
  }

  async function save() {
    setPending(true);
    setStatus(null);
    const res = await saveWebsite({
      theme: d.theme,
      heroTitle: d.hero_title,
      heroSubtitle: d.hero_subtitle,
      heroImageUrl: d.hero_image_url,
      galleryUrls: d.gallery_urls,
      primaryColor: d.primary_color,
      about: d.about,
      socialLinks: d.social_links.filter((s) => s.platform && s.url),
      seoTitle: d.seo_title,
      seoDescription: d.seo_description,
      seoKeywords: d.seo_keywords,
      mapsUrl: d.maps_url || null,
      sections: d.sections as unknown as Record<string, boolean>,
      stats: d.stats.filter((s) => s.label && s.value),
      reviews: d.reviews.filter((r) => r.name && r.text),
      siteFaqs: d.site_faqs.filter((f) => f.question && f.answer),
      contact: d.contact,
      ctaHeading: d.cta_heading,
      ctaSubheading: d.cta_subheading,
      heroBadge: d.hero_badge,
      trustItems: d.trust_items.filter(Boolean),
    });
    setPending(false);
    setStatus(res?.error ? res.error : "Saved ✓");
    if (!res?.error) setPreviewKey((k) => k + 1); // reload the live preview
  }

  if (locked) {
    return (
      <div className="card mt-6 max-w-xl text-center">
        <p className="text-sm text-gray-400">
          The website builder is available on paid plans. Upgrade in Billing to unlock it.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 grid gap-5 lg:grid-cols-[200px_1fr_1fr]">
      {/* ── Section nav ───────────────────────────────────────── */}
      <nav className="card h-fit space-y-0.5 p-2">
        {SECTION_META.map((s) => {
          const visible = d.sections[s.key];
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm ${
                section === s.key
                  ? "bg-brand-muted text-brand"
                  : "text-gray-400 hover:bg-ink-overlay"
              }`}
            >
              <span>
                {s.icon} {s.label}
              </span>
              <span className={`h-1.5 w-1.5 rounded-full ${visible ? "bg-emerald-400" : "bg-gray-600"}`} />
            </button>
          );
        })}
      </nav>

      {/* ── Fields ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold capitalize text-white">
              {SECTION_META.find((s) => s.key === section)?.label}
            </h2>
            <label className="flex items-center gap-2 text-xs text-gray-400">
              Visible
              <button
                onClick={() => toggleSection(section, !d.sections[section])}
                className={`h-5 w-9 rounded-full p-0.5 transition-colors ${
                  d.sections[section] ? "bg-brand" : "bg-ink-soft"
                }`}
                role="switch"
                aria-checked={d.sections[section]}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                    d.sections[section] ? "translate-x-4" : ""
                  }`}
                />
              </button>
            </label>
          </div>

          <div className="mt-4 space-y-3">
            {section === "hero" && (
              <>
                <Field label="Badge (above headline)">
                  <input
                    className="input"
                    placeholder="Trusted by hundreds"
                    value={d.hero_badge}
                    onChange={(e) => set("hero_badge", e.target.value)}
                  />
                </Field>
                <Field label="Hero title">
                  <input className="input" value={d.hero_title} onChange={(e) => set("hero_title", e.target.value)} />
                </Field>
                <Field label="Hero subtitle">
                  <input className="input" value={d.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} />
                </Field>
                <Field label="Hero image">
                  <input
                    type="file"
                    accept="image/*"
                    className="text-sm text-gray-400"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploading(true);
                      const url = await uploadTo(f);
                      if (url) set("hero_image_url", url);
                      setUploading(false);
                    }}
                  />
                </Field>
                <Field label="Primary color">
                  <input
                    type="color"
                    className="h-10 w-full rounded-xl border border-ink-soft bg-ink-overlay"
                    value={d.primary_color}
                    onChange={(e) => set("primary_color", e.target.value)}
                  />
                </Field>
                <div className="border-t border-ink-border pt-3">
                  <div className="section-title mb-2">Trust bar (icons below hero buttons)</div>
                  {d.trust_items.map((t, i) => (
                    <div key={i} className="mb-2 flex items-center gap-2">
                      <input
                        className="input"
                        value={t}
                        placeholder="5-star rated"
                        onChange={(e) =>
                          set("trust_items", d.trust_items.map((x, j) => (j === i ? e.target.value : x)))
                        }
                      />
                      <button
                        onClick={() => set("trust_items", d.trust_items.filter((_, j) => j !== i))}
                        className="text-rose-400"
                        aria-label="Remove trust item"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                  {d.trust_items.length < 6 && (
                    <button
                      onClick={() => set("trust_items", [...d.trust_items, ""])}
                      className="text-sm font-medium text-brand"
                    >
                      + Add trust item
                    </button>
                  )}
                </div>
              </>
            )}

            {section === "about" && (
              <Field label="About your business">
                <textarea rows={6} className="input" value={d.about} onChange={(e) => set("about", e.target.value)} />
              </Field>
            )}

            {section === "services" && (
              <p className="text-sm text-gray-500">
                Your active services are shown automatically — manage them on the{" "}
                <a href="/dashboard/services" className="text-brand">Services page</a>.
              </p>
            )}

            {section === "stats" && (
              <ListEditor
                items={d.stats}
                onChange={(v) => set("stats", v)}
                max={6}
                empty={{ label: "", value: "" }}
                render={(item, update) => (
                  <div className="flex gap-2">
                    <input className="input" placeholder="Value (15+)" value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} />
                    <input className="input" placeholder="Label (Years of care)" value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} />
                  </div>
                )}
              />
            )}

            {section === "reviews" && (
              <ListEditor
                items={d.reviews}
                onChange={(v) => set("reviews", v)}
                max={12}
                empty={{ name: "", text: "", rating: 5 }}
                render={(item, update) => (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input className="input" placeholder="Name" value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} />
                      <select className="input max-w-[90px]" value={item.rating} onChange={(e) => update({ ...item, rating: Number(e.target.value) })}>
                        {[5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>{r}★</option>
                        ))}
                      </select>
                    </div>
                    <textarea rows={2} className="input" placeholder="Review text" value={item.text} onChange={(e) => update({ ...item, text: e.target.value })} />
                  </div>
                )}
              />
            )}

            {section === "faq" && (
              <ListEditor
                items={d.site_faqs}
                onChange={(v) => set("site_faqs", v)}
                max={20}
                empty={{ question: "", answer: "" }}
                render={(item, update) => (
                  <div className="space-y-2">
                    <input className="input" placeholder="Question" value={item.question} onChange={(e) => update({ ...item, question: e.target.value })} />
                    <textarea rows={2} className="input" placeholder="Answer" value={item.answer} onChange={(e) => update({ ...item, answer: e.target.value })} />
                  </div>
                )}
              />
            )}

            {section === "gallery" && (
              <>
                {d.gallery_urls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {d.gallery_urls.map((url) => (
                      <div key={url} className="group relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-16 w-full rounded-lg object-cover" />
                        <button
                          onClick={() => set("gallery_urls", d.gallery_urls.filter((u) => u !== url))}
                          className="absolute -right-1 -top-1 hidden h-5 w-5 rounded-full bg-rose-500 text-xs text-white group-hover:block"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading || d.gallery_urls.length >= MAX_GALLERY}
                  className="text-sm text-gray-400"
                  onChange={async (e) => {
                    if (!e.target.files?.length) return;
                    setUploading(true);
                    const room = MAX_GALLERY - d.gallery_urls.length;
                    const next = [...d.gallery_urls];
                    for (const f of Array.from(e.target.files).slice(0, room)) {
                      const url = await uploadTo(f);
                      if (url) next.push(url);
                    }
                    set("gallery_urls", next);
                    setUploading(false);
                  }}
                />
                {uploading && <p className="text-xs text-gray-500">Uploading…</p>}
              </>
            )}

            {section === "contact" && (
              <>
                <Field label="Address">
                  <input className="input" value={d.contact.address} onChange={(e) => set("contact", { ...d.contact, address: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone">
                    <input className="input" value={d.contact.phone} onChange={(e) => set("contact", { ...d.contact, phone: e.target.value })} />
                  </Field>
                  <Field label="Public email">
                    <input className="input" value={d.contact.email} onChange={(e) => set("contact", { ...d.contact, email: e.target.value })} />
                  </Field>
                </div>
                <Field label="Google Maps link">
                  <input className="input" placeholder="https://maps.app.goo.gl/…" value={d.maps_url ?? ""} onChange={(e) => set("maps_url", e.target.value || null)} />
                </Field>
                <div className="section-title pt-2">Social links</div>
                <ListEditor
                  items={d.social_links}
                  onChange={(v) => set("social_links", v)}
                  max={20}
                  empty={{ platform: "", url: "" }}
                  render={(item, update) => (
                    <div className="flex gap-2">
                      <input className="input max-w-[130px]" placeholder="Platform" value={item.platform} onChange={(e) => update({ ...item, platform: e.target.value })} />
                      <input className="input" placeholder="https://…" value={item.url} onChange={(e) => update({ ...item, url: e.target.value })} />
                    </div>
                  )}
                />
              </>
            )}

            {section === "cta" && (
              <>
                <Field label="CTA heading">
                  <input className="input" placeholder="Ready to get started?" value={d.cta_heading} onChange={(e) => set("cta_heading", e.target.value)} />
                </Field>
                <Field label="CTA subheading">
                  <input className="input" placeholder="Book your appointment online in minutes." value={d.cta_subheading} onChange={(e) => set("cta_subheading", e.target.value)} />
                </Field>
              </>
            )}
          </div>
        </div>

        {/* SEO always available */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-white">SEO</h2>
          <Field label={`Page title (${d.seo_title.length}/70)`}>
            <input className="input" maxLength={70} value={d.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
          </Field>
          <Field label={`Meta description (${d.seo_description.length}/170)`}>
            <textarea rows={2} maxLength={170} className="input" value={d.seo_description} onChange={(e) => set("seo_description", e.target.value)} />
          </Field>
          <Field label="Keywords (comma-separated)">
            <input className="input" value={d.seo_keywords} onChange={(e) => set("seo_keywords", e.target.value)} />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={pending || uploading} className="btn-primary">
            {pending ? "Saving…" : "Save"}
          </button>
          {status && <span className="text-sm text-gray-400">{status}</span>}
        </div>
      </div>

      {/* ── Live preview: the REAL site in an iframe ───────────── */}
      <div className="card h-fit overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-ink-border px-4 py-2 text-xs text-gray-500">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live Preview
            <span className="capitalize text-gray-600">· {d.theme} template</span>
          </span>
          <span className="flex gap-1 rounded-lg border border-ink-soft bg-ink p-0.5">
            <button
              onClick={() => setDevice("desktop")}
              className={`rounded-md px-2.5 py-1 ${device === "desktop" ? "bg-brand text-white" : "text-gray-400"}`}
            >
              🖥 Desktop
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`rounded-md px-2.5 py-1 ${device === "mobile" ? "bg-brand text-white" : "text-gray-400"}`}
            >
              📱 Mobile
            </button>
          </span>
        </div>
        <div className="flex justify-center bg-ink-overlay p-3">
          <iframe
            key={previewKey}
            src={`/site/${subdomain}?preview=1`}
            title="Website live preview"
            className={`h-[70vh] rounded-xl border border-ink-soft bg-white transition-all ${
              device === "mobile" ? "w-[390px]" : "w-full"
            }`}
          />
        </div>
        <div className="border-t border-ink-border px-4 py-2 text-[11px] text-gray-500">
          Renders your actual site (draft included). Saving refreshes the preview.
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function ListEditor<T>({
  items,
  onChange,
  max,
  empty,
  render,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  max: number;
  empty: T;
  render: (item: T, update: (v: T) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-ink-soft p-3">
          {render(item, (v) => onChange(items.map((x, j) => (j === i ? v : x))))}
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="mt-2 text-xs text-rose-400"
          >
            Remove
          </button>
        </div>
      ))}
      {items.length < max && (
        <button onClick={() => onChange([...items, empty])} className="btn-ghost">
          + Add
        </button>
      )}
    </div>
  );
}
