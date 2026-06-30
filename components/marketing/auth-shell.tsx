import Link from "next/link";
import { Logo } from "./logo";
import { Bloom } from "./decor";

/**
 * Branded chrome for the auth pages (login / signup / password reset) so they
 * match the marketing theme: ambient violet glow, faint grid, and a liquid-glass
 * card. Purely presentational, safe to render inside client pages.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-16">
      {/* Ambient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,#000_15%,transparent_70%)]" />
        <Bloom className="left-1/2 top-1/4 h-[440px] w-[600px] -translate-x-1/2" color="rgba(124,121,246,0.26)" blur={140} />
        <Bloom className="left-1/2 bottom-0 h-[320px] w-[420px] -translate-x-1/2" color="rgba(139,92,246,0.18)" blur={120} delay={3} />
      </div>

      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-semibold tracking-tight text-white">Slotnest</span>
        </Link>

        <div className="liquid-card p-7">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-gray-400">{subtitle}</p>
          {children}
        </div>

        {footer && <div className="mt-5 text-center text-sm text-gray-400">{footer}</div>}
      </div>
    </div>
  );
}
