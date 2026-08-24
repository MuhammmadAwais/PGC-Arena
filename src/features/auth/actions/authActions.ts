"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const cookieStore = await cookies();

  if (!remember) {
    // Set flag for session-only cookies (expires on browser close)
    cookieStore.set("pgc_remember_me", "false");
  } else {
    // Clear flag to use default persistent cookies (1 year)
    cookieStore.delete("pgc_remember_me");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message || "Failed to authenticate" };
  }

  // Fetch user role and first login status
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, is_first_login")
    .eq("id", data.user.id)
    .single();

  if (userError || !userData) {
    return { error: `Failed to fetch user profile: ${userError?.message || "No data"}` };
  }

  // Redirection Matrix
  if (userData.is_first_login) {
    redirect("/onboarding");
  }

  switch (userData.role) {
    case "SUPER_ADMIN":
      redirect("/admin");
    case "CAMPUS_MANAGER":
      redirect("/manager");
    case "TEACHER":
      redirect("/teacher");
    case "STUDENT":
      redirect("/arena");
    default:
      return { error: "Unknown user role" };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
