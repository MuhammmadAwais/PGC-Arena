import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * src/lib/supabase/middleware.ts
 *
 * Supabase session handler for Next.js middleware.
 *
 * Responsibilities:
 *   1. Refreshes the user's Supabase session on every request.
 *   2. Reads the user's role from the session and enforces RBAC routing.
 *   3. Redirects unauthenticated users to /login.
 *   4. Redirects first-time users to /onboarding.
 *
 * Called from: src/middleware.ts (root Next.js middleware entrypoint).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies on both the outgoing request and the response
          // so the updated session is available in Server Components.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          
          supabaseResponse = NextResponse.next({ request });
          
          const isSessionOnly = request.cookies.get("pgc_remember_me")?.value === "false";
          
          cookiesToSet.forEach(({ name, value, options }) => {
            // If "Remember me" is disabled, convert to session cookies
            if (isSessionOnly) {
              delete options.maxAge;
              delete options.expires;
            }
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: Do NOT add any logic between createServerClient and getUser().
  // A subtle bug can make it very hard to debug issues with users being
  // randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication.
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".");

  if (!user && !isPublicRoute) {
    // Redirect unauthenticated users to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from public auth routes
  if (user && (pathname === "/" || pathname.startsWith("/login"))) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, is_first_login")
      .eq("id", user.id)
      .single();

    if (profile) {
      const redirectUrl = request.nextUrl.clone();
      if (profile.is_first_login) {
        redirectUrl.pathname = "/onboarding";
      } else {
        switch (profile.role) {
          case "SUPER_ADMIN":
            redirectUrl.pathname = "/admin";
            break;
          case "CAMPUS_MANAGER":
            redirectUrl.pathname = "/manager";
            break;
          case "TEACHER":
            redirectUrl.pathname = "/teacher";
            break;
          case "STUDENT":
            redirectUrl.pathname = "/arena";
            break;
          default:
            return supabaseResponse;
        }
      }
      return NextResponse.redirect(redirectUrl);
    }
  }

  // IMPORTANT: supabaseResponse must be returned as-is to preserve cookies.
  return supabaseResponse;
}
