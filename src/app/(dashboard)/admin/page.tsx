import type { Metadata } from "next";
import { LayoutDashboard, Users, Trophy, Zap, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Command Center — PGC Arena Admin",
  description: "Super Admin global overview: campuses, live matches, and system health.",
};

const statCards = [
  { label: "Total Campuses", value: "—", icon: LayoutDashboard, color: "text-pgc-red" },
  { label: "Active Students", value: "—", icon: Users, color: "text-pgc-gold" },
  { label: "Live Matches", value: "—", icon: Zap, color: "text-pgc-emerald" },
  { label: "Tournaments", value: "—", icon: Trophy, color: "text-purple-400" },
];

export default function AdminCommandCenterPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            Command <span className="text-pgc-red">Center</span>
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Global tournament management, campus provisioning, and system health overview.
          </p>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className={[
              "rounded-2xl p-5",
              "bg-white/[0.04] border border-white/[0.08]",
              "backdrop-blur-md",
              "hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-200",
            ].join(" ")}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-[0.12em]">
                {label}
              </p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`font-display text-4xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Placeholder canvas ───────────────────────────────────── */}
      <div
        className={[
          "rounded-2xl p-8 min-h-[320px] flex flex-col items-center justify-center gap-4",
          "bg-white/[0.03] border border-white/[0.08] border-dashed",
          "backdrop-blur-md",
        ].join(" ")}
      >
        <TrendingUp className="w-10 h-10 text-white/15" />
        <div className="text-center">
          <p className="text-sm font-semibold text-white/30">Analytics dashboard coming soon</p>
          <p className="text-xs text-white/20 mt-1">
            Live match feeds, ELO trends, and campus performance charts will render here.
          </p>
        </div>
      </div>
    </div>
  );
}
