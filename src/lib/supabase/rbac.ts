import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  campus_id: string | null;
  team_id: string | null;
  full_name: string;
}

export type AuthResult =
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; error: string };

/**
 * src/lib/supabase/rbac.ts
 *
 * Zero-Trust Server-Side RBAC Enforcement Utility for Server Actions.
 *
 * Verifies that:
 * 1. The incoming request has a valid Supabase Auth cookie session.
 * 2. The user profile exists in the `public.users` database table.
 * 3. The user holds at least one of the specified `allowedRoles`.
 *
 * If `allowedRoles` is empty or omitted, any authenticated user is authorized.
 */
export async function requireAuth(
  allowedRoles: UserRole[] = []
): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    // 1. Validate active session with Supabase Auth server (secure JWT check)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        authorized: false,
        error: "Authentication required. Please log in to perform this action.",
      };
    }

    // 2. Cross-reference role from public.users table via supabaseAdmin for 100% reliability
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("id, role, campus_id, team_id, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return {
        authorized: false,
        error: "Unauthorized: User profile does not exist in the system.",
      };
    }

    // 3. Assert Role-Based Access Control
    if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
      return {
        authorized: false,
        error: `Forbidden: Access restricted. Requires one of [${allowedRoles.join(
          ", "
        )}]. Current role: ${profile.role}.`,
      };
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email || "",
        role: profile.role,
        campus_id: profile.campus_id,
        team_id: profile.team_id,
        full_name: profile.full_name,
      },
    };
  } catch (err: any) {
    console.error("RBAC Session Verification Exception:", err);
    return {
      authorized: false,
      error: "Security verification failed. Please try again.",
    };
  }
}

/**
 * Convenience helper to strictly require the SUPER_ADMIN role.
 */
export async function requireSuperAdmin(): Promise<AuthResult> {
  return requireAuth(["SUPER_ADMIN"]);
}

/**
 * Convenience helper to require either SUPER_ADMIN or CAMPUS_MANAGER.
 */
export async function requireManagerOrAdmin(): Promise<AuthResult> {
  return requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER"]);
}
