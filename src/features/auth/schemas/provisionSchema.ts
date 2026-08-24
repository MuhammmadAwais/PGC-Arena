import { z } from "zod";

export const provisionUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  full_name: z.string().min(2, "Full name must be at least 2 characters long"),
  role: z.enum(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER", "STUDENT"], {
    message: "Invalid role selected",
  }),
  roll_number: z.string().min(1, "Roll number is required"),
  campus_id: z.string().optional().or(z.literal("")),
});

export type ProvisionUserFormData = z.infer<typeof provisionUserSchema>;
