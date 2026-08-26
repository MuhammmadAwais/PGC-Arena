import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Flame,
  ChevronLeft,
  Building2,
  Trophy,
  Crown,
  Users,
  Shield,
  User,
  Hash,
  ExternalLink,
} from "lucide-react";
import { getSingleTeamData } from "@/features/campus/actions/campusActions";

interface TeamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { id } = await params;
  const data = await getSingleTeamData(id);

  if (!data || !data.team) {
    notFound();
  }

  const { team, campus, leader: captain, members: teamMembers } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ── 1. Top Breadcrumbs Navigation ───────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href={campus ? `/admin/campuses/${campus.id}` : "/admin/campuses"}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors group font-sans"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          <span>Back to {campus ? campus.name : "Campuses & Squads"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-300">
            SQUAD ID: {team.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* ── 2. Squad Hero Master Banner ─────────────────────────── */}
      <div className="relative rounded-3xl border border-white/10 bg-[#0B0C16] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Full-width banner background */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-gradient-to-r from-[#1b153a] via-[#101124] to-[#0B0C16]">
          {team.banner_url ? (
            <img
              src={team.banner_url}
              alt={team.name}
              className="w-full h-full object-cover opacity-45"
            />
          ) : (
            <div className="w-full h-full bg-white/[0.02]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C16] via-[#0B0C16]/60 to-transparent" />
        </div>

        {/* Hero Info Overlay */}
        <div className="relative px-6 sm:px-8 pb-8 -mt-20 sm:-mt-24 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-end gap-5">
            {/* Team Logo Emblem */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-black/90 border-2 border-white/20 p-2 shadow-2xl flex items-center justify-center shrink-0 backdrop-blur-md overflow-hidden">
              {team.logo_url ? (
                <img
                  src={team.logo_url}
                  alt={team.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Flame className="w-10 h-10 text-pgc-red" />
              )}
            </div>

            {/* Title & Campus Tag */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-pgc-red/20 border border-pgc-red/40 text-pgc-red text-[10px] font-mono font-bold tracking-wider uppercase">
                  COMPETITIVE SQUAD
                </span>
                {campus && (
                  <Link
                    href={`/admin/campuses/${campus.id}`}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-sans font-medium transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{campus.name}</span>
                  </Link>
                )}
              </div>
              <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
                {team.name}
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Active tournament roster enrolled in institutional esports championships.
              </p>
            </div>
          </div>

          {/* ELO Rating Box */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3.5 rounded-2xl bg-black/60 border border-pgc-gold/40 backdrop-blur-md text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-display tracking-wider">
                Current ELO Score
              </span>
              <span className="font-display font-black text-2xl text-pgc-gold flex items-center justify-end gap-1.5">
                <Trophy className="w-5 h-5 text-pgc-gold" />
                {team.elo_rating ?? 0} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Squad Summary Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/[0.08] bg-white/[0.02] divide-x divide-white/[0.06]">
          <div className="p-4 px-6 text-center sm:text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Active Players</p>
            <p className="font-display font-black text-xl text-white mt-0.5">{teamMembers.length}</p>
          </div>
          <div className="p-4 px-6 text-center sm:text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Team Captain</p>
            <p className="font-display font-bold text-sm text-pgc-gold truncate mt-1">
              {captain ? captain.full_name : "Unassigned"}
            </p>
          </div>
          <div className="p-4 px-6 text-center sm:text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Captain IGN</p>
            <p className="font-mono font-bold text-xs text-white truncate mt-1">
              {captain?.ign ? `#${captain.ign}` : "N/A"}
            </p>
          </div>
          <div className="p-4 px-6 text-center sm:text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Assigned Campus</p>
            <p className="font-display font-bold text-xs text-white truncate mt-1">
              {campus ? campus.name : "Unassigned"}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Team Captain Highlight ────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
          <Crown className="w-5 h-5 text-pgc-gold" />
          <span>Appointed Team Captain</span>
        </h2>

        {captain ? (
          <div className="p-6 rounded-2xl bg-[#0B0C16] border border-pgc-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              {captain.avatar_url ? (
                <img
                  src={captain.avatar_url}
                  alt={captain.full_name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-pgc-gold shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-pgc-gold/20 text-pgc-gold flex items-center justify-center font-display font-black text-xl border border-pgc-gold/30">
                  <Crown className="w-8 h-8" />
                </div>
              )}
              <div className="space-y-1 font-sans">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-pgc-gold/20 text-pgc-gold text-[10px] font-bold uppercase font-display">
                    Squad Leader
                  </span>
                  {captain.ign && (
                    <span className="px-2 py-0.5 rounded bg-white/[0.08] text-pgc-gold font-mono text-xs font-bold">
                      #{captain.ign}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-black text-xl text-white">
                  {captain.full_name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">Roll: {captain.roll_number} • {captain.email}</p>
              </div>
            </div>

            <Link
              href={`/admin/users/${captain.id}`}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-white transition-colors font-sans text-center"
            >
              Manage Captain Profile
            </Link>
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.01] text-center text-slate-400 font-sans text-xs">
            No captain currently assigned to this squad.
          </div>
        )}
      </div>

      {/* ── 4. Active Player Roster Table ────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Active Squad Roster ({teamMembers.length} Players)</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B0C16] overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white/[0.02] border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4 font-sans">Player Name</th>
                <th className="py-3.5 px-4 font-sans">In-Game Name (IGN)</th>
                <th className="py-3.5 px-4 font-sans">Roll Number</th>
                <th className="py-3.5 px-4 font-sans">Squad Role</th>
                <th className="py-3.5 px-4 font-sans">Academic Program</th>
                <th className="py-3.5 px-4 text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    No active players in this squad roster.
                  </td>
                </tr>
              ) : (
                teamMembers.map((player) => (
                  <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {player.avatar_url ? (
                          <img src={player.avatar_url} alt={player.full_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center">
                            {player.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white text-sm">{player.full_name}</p>
                          <p className="text-[11px] text-slate-400">{player.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-pgc-gold">
                      {player.ign ? `#${player.ign}` : <span className="text-slate-500 font-sans italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {player.roll_number}
                    </td>
                    <td className="py-3.5 px-4">
                      {player.is_team_leader ? (
                        <span className="px-2 py-0.5 rounded bg-pgc-gold/15 text-pgc-gold border border-pgc-gold/30 font-bold text-[11px]">
                          👑 Captain
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[11px]">
                          Active Player
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {player.academic_program || "ICS / Pre-Engineering"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/users/${player.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-colors"
                      >
                        <span>Manage Player</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
