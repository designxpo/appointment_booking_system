import { MarketingShell } from "./marketing-shell";

export interface LegalSection {
  heading: string;
  /** One or more paragraphs. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
}

/**
 * Shared layout for the marketing legal/info pages (privacy, terms, security).
 * Themed to match the dark site; content is passed in as structured sections.
 */
export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
        <header className="border-b border-white/[0.06] pb-8">
          <span className="badge-pill">Legal</span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-400">{intro}</p>
          <p className="mt-4 text-xs text-gray-500">Last updated {updated}</p>
        </header>

        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-semibold text-white">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed text-gray-400">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-3 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm leading-relaxed text-gray-400">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-xl border border-white/[0.05] bg-white/[0.03] p-4 text-xs leading-relaxed text-gray-500">
          This is a general template provided for convenience and is not legal
          advice. Review and adapt it with qualified counsel before relying on it
          for your business.
        </p>
      </article>
    </MarketingShell>
  );
}
