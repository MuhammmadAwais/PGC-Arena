import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
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

  if (!profile.is_first_login) {
    // If not first login, redirect to their respective dashboard
    if (profile.role === "SUPER_ADMIN") redirect("/admin");
    if (profile.role === "CAMPUS_MANAGER") redirect("/manager");
    if (profile.role === "TEACHER") redirect("/teacher");
    if (profile.role === "STUDENT") redirect("/arena");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-10 bg-pgc-indigo">
      <div className="bg-white/10 p-10 rounded-2xl backdrop-blur-md max-w-lg w-full text-center border border-white/20 shadow-2xl">
        <h1 className="text-3xl font-display font-bold text-white mb-4">
          Complete Your Profile, {profile.full_name}
        </h1>
        <p className="text-white/60 mb-8">
          Please update your password and verify your details before continuing.
        </p>
        <button className="w-full py-3 rounded-xl bg-pgc-red text-white font-bold hover:bg-pgc-red/80 transition-colors">
          Continue
        </button>
      </div>
    </main>
  );
}
