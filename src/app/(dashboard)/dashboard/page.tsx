import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — PGC Arena",
  description: "Your PGC Arena command centre.",
};

/**
 * Placeholder dashboard page.
 * Full implementation (RBAC-split views) comes in a later step.
 */
export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      {/* Animated arena glow */}
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-pgc-red/10 blur-2xl animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-pgc-red/30 bg-pgc-navy/60 backdrop-blur-sm">
          <span className="font-display text-3xl font-bold text-pgc-red">
            A
          </span>
        </div>
      </div>

      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-white tracking-tight">
          PGC{" "}
          <span className="text-pgc-red">Arena</span>
        </h1>
        <p className="mt-3 text-sm text-white/40 max-w-xs leading-relaxed">
          Dashboard is under construction.
          Authentication and role-based views will be wired in the next step.
        </p>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-pgc-emerald/30 bg-pgc-emerald/10">
        <span className="h-1.5 w-1.5 rounded-full bg-pgc-emerald animate-pulse" />
        <span className="text-xs font-semibold text-pgc-emerald uppercase tracking-widest">
          Auth scaffold ready
        </span>
      </div>
    </div>
  );
}
