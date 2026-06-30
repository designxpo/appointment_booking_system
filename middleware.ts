import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const DEV_MOCK =
  process.env.NEXT_PUBLIC_DEV_MOCK === "true" &&
  process.env.NODE_ENV !== "production";

// e.g. "slotnest.ai" — tenant sites live at <subdomain>.slotnest.ai.
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
// Hosts that are NOT a tenant (the marketing/app domain itself).
const RESERVED = new Set(["www", "app", "admin", "api"]);

/**
 * Extract a tenant subdomain from the Host header, or null if this is the
 * apex / app domain / localhost.
 */
function tenantFromHost(host: string | null): string | null {
  if (!host || !ROOT_DOMAIN) return null;
  const hostname = host.split(":")[0];
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return null;
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return null;
  const sub = hostname.slice(0, -(`.${ROOT_DOMAIN}`).length);
  if (!sub || RESERVED.has(sub) || sub.includes(".")) return null;
  return sub;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Subdomain routing: <sub>.rootdomain/* → /site/<sub> (internal rewrite).
  // Crawler metadata files (/sitemap.xml, /robots.txt) are served from the app
  // root on every host — rewriting them under /site/<sub> would 404.
  const tenant = tenantFromHost(request.headers.get("host"));
  const isCrawlerMeta = pathname === "/sitemap.xml" || pathname === "/robots.txt";
  if (
    tenant &&
    !isCrawlerMeta &&
    !pathname.startsWith("/site/") &&
    !pathname.startsWith("/api/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/site/${tenant}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2) Auth guard for the dashboard.
  if (DEV_MOCK) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run everywhere except Next internals, static files, and the widget loader,
  // so subdomain rewrites can fire on the tenant's root path too.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|widget.js).*)"],
};
