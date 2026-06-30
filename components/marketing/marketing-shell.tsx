import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

/**
 * Page chrome shared by the marketing sub-pages (contact, legal). Mirrors the
 * landing page's ambient background, sticky nav, and footer so every route
 * feels like one site. The landing page composes these pieces itself because
 * its hero needs a bespoke background.
 */
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-ink">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_75%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-brand/15 blur-[130px]" />
      </div>

      <SiteNav />
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
