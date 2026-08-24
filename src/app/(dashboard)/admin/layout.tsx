import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/features/dashboard/components/Sidebar";
import { Navbar } from "@/features/dashboard/components/Navbar";
import type { Tables } from "@/types/database.types";

type UserProfile = Tables<"users">;

/**
 * src/app/(dashboard)/admin/layout.tsx
 *
 * Server-side RBAC guard + layout shell for all /admin/* routes.
 * Enforces SUPER_ADMIN role before rendering any dashboard content.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // ── 1. Verify session ───────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ── 2. Fetch user profile ────────────────────────────────────────
  const { data: profile, error } = await supabase
    .from("users")
    .select("id, full_name, role, roll_number, is_first_login, campus_id, ign, team_id")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  // ── 3. First-login redirect ──────────────────────────────────────
  if (profile.is_first_login) {
    redirect("/onboarding");
  }

  // ── 4. Hard RBAC gate ───────────────────────────────────────────
  if (profile.role !== "SUPER_ADMIN") {
    if (profile.role === "CAMPUS_MANAGER") redirect("/manager");
    if (profile.role === "TEACHER") redirect("/teacher");
    if (profile.role === "STUDENT") redirect("/arena");
    redirect("/login");
  }

  // ── 5. Render dashboard shell ────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar profile={profile as UserProfile} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main
          id="admin-main-canvas"
          className="flex-1 overflow-y-auto p-6 lg:p-8 relative z-0"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
