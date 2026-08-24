"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { provisionUserSchema } from "../schemas/provisionSchema";
import { revalidatePath } from "next/cache";

export async function provisionUser(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const result = provisionUserSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password, full_name, role, roll_number, campus_id } = result.data;

  try {
    // 1. Create the user in Supabase Auth (bypassing normal flow)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return { error: authError?.message || "Failed to create user in Auth." };
    }

    const userId = authData.user.id;

    // 2. Insert into public.users table
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        full_name,
        role,
        roll_number,
        campus_id: campus_id || null, // Convert empty string to null if applicable
        is_first_login: true,
      });

    if (dbError) {
      // If the public table insertion fails, attempt to delete the auth user to maintain integrity
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { error: dbError.message || "Failed to create user profile in Database." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: `User ${full_name} provisioned successfully.` };
  } catch (err: any) {
    // Do not leak internal server errors to the client
    console.error("Provisioning Error:", err);
    return { error: "An unexpected error occurred during user provisioning." };
  }
}
