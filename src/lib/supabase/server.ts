import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * src/lib/supabase/server.ts
 *
 * Server-side Supabase client.
 * Use in React Server Components and Server Actions ("use server") for:
 *   - Database reads with full RLS enforcement
 *   - Authenticated mutations via Server Actions
 *
 * Import path: @/lib/supabase/server
 * NEVER use this in Client Components.
 */

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            const isSessionOnly = cookieStore.get("pgc_remember_me")?.value === "false";
            
            cookiesToSet.forEach(({ name, value, options }) => {
              // If "Remember me" is disabled, convert to session cookies
              if (isSessionOnly) {
                delete options.maxAge;
                delete options.expires;
              }
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — cookie writes are no-ops.
            // The middleware handles session refresh instead.
          }
        },
      },
    },
  );
}

/**
 * Service-role admin client.
 * STRICTLY for privileged Server Actions only (e.g., user provisioning).
 * NEVER expose to the client bundle or assign to NEXT_PUBLIC_ vars.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // no-op in Server Components
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
