import type { Metadata } from "next";
import { TrendingUp, Medal, Crown, Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Tier Lists & ELO — PGC Arena Admin",
  description: "View global ELO rankings, tier classifications, and team performance trends.",
};

const tiers = [
  { name: "S Tier", range: "2200+ ELO", color: "from-pgc-gold/20 to-pgc-gold/5 border-pgc-gold/30", textColor: "text-pgc-gold", icon: Crown },
  { name: "A Tier", range: "1800–2199 ELO", color: "from-pgc-red/20 to-pgc-red/5 border-pgc-red/30", textColor: "text-pgc-red", icon: Flame },
  { name: "B Tier", range: "1400–1799 ELO", color: "from-blue-500/15 to-blue-500/5 border-blue-500/25", textColor: "text-blue-400", icon: Medal },
  { name: "C Tier", range: "1000–1399 ELO", color: "from-white/10 to-white/5 border-white/10", textColor: "text-white/50", icon: TrendingUp },
];

export default function RankingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          Tier Lists &amp; <span className="text-pgc-red">ELO</span>
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Global ELO standings, tier classifications, and inter-campus competitive performance metrics.
        </p>
      </div>

      {/* Tier breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map(({ name, range, color, textColor, icon: Icon }) => (
          <div
            key={name}
            className={`rounded-2xl p-5 bg-gradient-to-b ${color} border hover:scale-[1.02] transition-all duration-200`}
          >
            <Icon className={`w-5 h-5 mb-3 ${textColor}`} />
            <p className={`font-display text-lg font-bold ${textColor}`}>{name}</p>
            <p className="text-xs text-white/30 mt-1">{range}</p>
            <p className="font-display text-2xl font-bold text-white/20 mt-3">—</p>
            <p className="text-[10px] text-white/20">teams</p>
          </div>
        ))}
      </div>

      {/* Leaderboard table placeholder */}
      <div className="rounded-2xl p-10 min-h-[320px] flex flex-col items-center justify-center gap-4 bg-white/[0.03] border border-white/[0.08] border-dashed">
        <TrendingUp className="w-8 h-8 text-white/15" />
        <div className="text-center">
          <p className="text-sm font-semibold text-white/30">LiquipediaTable component</p>
          <p className="text-xs text-white/20 mt-1 leading-relaxed max-w-sm">
            Sortable, filterable ELO rankings table with campus filters, match history sparklines,
            and win-rate indicators will render here.
          </p>
        </div>
        <p className="text-xs text-white/15">Route: /admin/rankings · Feature: tournaments</p>
      </div>
    </div>
  );
}
