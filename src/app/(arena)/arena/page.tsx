import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ArenaDashboardPage() {
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

  if (profile.role !== "STUDENT") {
    if (profile.role === "SUPER_ADMIN") redirect("/admin");
    if (profile.role === "CAMPUS_MANAGER") redirect("/manager");
    if (profile.role === "TEACHER") redirect("/teacher");
  }

  return (
    <main className="min-h-screen bg-pgc-navy p-10 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-display font-bold text-pgc-gold mb-4">
        Welcome to the Arena - {profile.full_name}
      </h1>
      <p className="text-white/60">
        Waiting for your teacher to start the match...
      </p>
    </main>
  );
}
