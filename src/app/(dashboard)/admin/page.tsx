import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, full_name, is_first_login")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.is_first_login) {
    redirect("/onboarding");
  }

  if (profile.role !== "SUPER_ADMIN") {
    if (profile.role === "CAMPUS_MANAGER") redirect("/manager");
    if (profile.role === "TEACHER") redirect("/teacher");
    if (profile.role === "STUDENT") redirect("/arena");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-display font-bold">
        Welcome to the Super Admin Dashboard - {profile.full_name}
      </h1>
      <p className="text-white/60">
        Global tournament management, campus provisioning, and master settings.
      </p>
    </div>
  );
}
