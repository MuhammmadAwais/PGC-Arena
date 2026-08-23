"use client";

/**
 * src/lib/supabase/client.ts
 *
 * Browser-side Supabase client.
 * Use in Client Components ("use client") for:
 *   - Supabase Realtime subscriptions
 *   - Client-side auth state listeners
 *
 * NEVER reference SUPABASE_SERVICE_ROLE_KEY here.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
