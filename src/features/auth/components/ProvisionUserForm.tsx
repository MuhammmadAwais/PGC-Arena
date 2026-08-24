"use client";

import { useState } from "react";
import { provisionUser } from "@/features/auth/actions/provisionUser";

export function ProvisionUserForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await provisionUser(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(result.message || "User provisioned successfully!");
      (e.target as HTMLFormElement).reset();
    }

    setIsLoading(false);
  }

  return (
    <div className="bg-pgc-navy p-8 rounded-2xl border border-white/10 shadow-xl max-w-xl w-full">
      <h2 className="text-2xl font-display font-bold text-white mb-6">Provision New User</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Full Name</label>
          <input
            name="full_name"
            type="text"
            required
            placeholder="John Doe"
            className="w-full rounded-xl bg-black/25 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pgc-red/60 focus:ring-1 focus:ring-pgc-red/60 transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="admin@pgc.edu.pk"
            className="w-full rounded-xl bg-black/25 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pgc-red/60 focus:ring-1 focus:ring-pgc-red/60 transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Temporary Password</label>
          <input
            name="password"
            type="password"
            required
            placeholder="Minimum 6 characters"
            className="w-full rounded-xl bg-black/25 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pgc-red/60 focus:ring-1 focus:ring-pgc-red/60 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Role</label>
            <select
              name="role"
              required
              className="w-full rounded-xl bg-black/25 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-pgc-red/60 focus:ring-1 focus:ring-pgc-red/60 transition-all cursor-pointer"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="CAMPUS_MANAGER">Campus Manager</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Roll / Employee ID</label>
            <input
              name="roll_number"
              type="text"
              required
              placeholder="e.g. F22-001"
              className="w-full rounded-xl bg-black/25 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pgc-red/60 focus:ring-1 focus:ring-pgc-red/60 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Campus ID (Optional)</label>
          <input
            name="campus_id"
            type="text"
            placeholder="Leave empty for global admins"
            className="w-full rounded-xl bg-black/25 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pgc-red/60 focus:ring-1 focus:ring-pgc-red/60 transition-all"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-pgc-red/30 bg-pgc-red/10 px-4 py-3 text-sm text-pgc-red">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-xl bg-pgc-red text-white font-semibold py-3.5 hover:bg-pgc-red/80 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Provisioning..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
