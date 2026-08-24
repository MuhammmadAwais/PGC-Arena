import type { Metadata } from "next";
import { Trophy, Plus, GitBranch, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Tournaments & Brackets — PGC Arena Admin",
  description: "Create and manage single/double elimination brackets, seeding, and match scheduling.",
};

const phases = [
  { name: "Round of 16", matches: 8, status: "Upcoming", color: "text-white/40" },
  { name: "Quarter Finals", matches: 4, status: "Upcoming", color: "text-white/40" },
  { name: "Semi Finals", matches: 2, status: "Upcoming", color: "text-white/40" },
  { name: "Grand Final", matches: 1, status: "Upcoming", color: "text-pgc-gold" },
];

export default function TournamentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            Tournaments &amp; <span className="text-pgc-red">Brackets</span>
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Generate brackets, seed teams, advance winners, and schedule match rounds.
          </p>
        </div>
        <button
          id="tournaments-new-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pgc-red text-white text-sm font-semibold hover:bg-pgc-hover active:scale-[0.98] transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Tournament
        </button>
      </div>

      {/* Phase overview */}
      <div className="grid grid-cols-4 gap-4">
        {phases.map(({ name, matches, status, color }) => (
          <div key={name} className="rounded-2xl p-4 bg-white/[0.04] border border-white/[0.08]">
            <GitBranch className={`w-4 h-4 mb-2 ${color}`} />
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-white/35 mt-0.5">{matches} matches</p>
            <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 block ${color}`}>{status}</span>
          </div>
        ))}
      </div>

      {/* Bracket placeholder */}
      <div className="rounded-2xl p-10 min-h-[400px] flex flex-col items-center justify-center gap-4 bg-white/[0.03] border border-white/[0.08] border-dashed">
        <div className="w-16 h-16 rounded-2xl bg-pgc-gold/10 border border-pgc-gold/20 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-pgc-gold/50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white/30">BracketTree component</p>
          <p className="text-xs text-white/20 mt-1 leading-relaxed max-w-sm">
            Interactive single/double-elimination bracket tree with drag-to-seed, auto-advance, and live score overlays.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/15">
          <Calendar className="w-3 h-3" />
          <span>Route: /admin/tournaments · Feature: tournaments</span>
        </div>
      </div>
    </div>
  );
}
