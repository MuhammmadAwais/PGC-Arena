import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * src/lib/supabase/admin.ts
 *
 * Supabase Service Role client for administrative bypasses.
 * This client bypasses all Row Level Security (RLS).
 *
 * WARNING: Never import this into a Client Component.
 * STRICTLY for use in Server Actions or Server Components only.
 */

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
