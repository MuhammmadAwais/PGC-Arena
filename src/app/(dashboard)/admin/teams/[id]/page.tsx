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
  Mail,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { getSingleTeamData } from "@/features/campus/actions/campusActions";
import { DetailStudentTable } from "@/features/campus/components/DetailStudentTable";

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

      {/* ── 2. Secondary Card: Squad Hero Banner Card (Top Featured) ── */}
      <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
        {/* Full-width banner background */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-r from-pgc-indigo/60 via-pgc-navy/80 to-black/60">
          {team.banner_url ? (
            <img
              src={team.banner_url}
              alt={team.name}
              className="w-full h-full object-cover opacity-40"
            />
          ) : (
            <div className="w-full h-full bg-white/[0.02]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C16] via-[#0B0C16]/60 to-transparent" />
        </div>

        {/* Hero Info Overlay */}
        <div className="relative px-6 sm:px-8 pb-7 -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-end gap-5">
            {/* Squad Logo Emblem */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-black/90 border-2 border-white/20 p-2 shadow-2xl flex items-center justify-center shrink-0 backdrop-blur-md overflow-hidden">
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

            {/* Title & Affiliation */}
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-pgc-red/20 border border-pgc-red/40 text-pgc-red text-[10px] font-mono font-bold tracking-wider uppercase">
                  COMPETITIVE SQUAD
                </span>
                {campus && (
                  <Link
                    href={`/admin/campuses/${campus.id}`}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{campus.name}</span>
                  </Link>
                )}
              </div>
              <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
                {team.name}
              </h1>
              <p className="text-xs text-slate-400">
                Official Punjab Group of Colleges esports tournament roster and competitive squad division.
              </p>
            </div>
          </div>

          {/* Captain Quick Block */}
          {captain && (
            <Link
              href={`/admin/users/${captain.id}`}
              className="p-3 px-4 rounded-2xl bg-black/40 border border-pgc-gold/30 backdrop-blur-md flex items-center gap-3 shrink-0 group font-sans"
            >
              {captain.avatar_url ? (
                <img src={captain.avatar_url} alt={captain.full_name} className="w-9 h-9 rounded-full object-cover border border-pgc-gold" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-pgc-gold/20 text-pgc-gold flex items-center justify-center font-bold text-xs">
                  <Crown className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-pgc-gold uppercase tracking-wider block font-display">
                  Squad Captain
                </span>
                <span className="text-xs font-bold text-white group-hover:text-pgc-gold transition-colors">
                  {captain.full_name}
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* ── 3. Primary Summary Stats Overview Cards (Below Banner) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Competitive ELO</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-pgc-gold mt-0.5 tracking-tight">
              {team.elo_rating ?? 1000} PTS
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-gold/15 text-pgc-gold flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Active Squad Size</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-cyan-400 mt-0.5 tracking-tight">
              {teamMembers.length} Players
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Campus Branch</p>
            <p className="font-display text-lg lg:text-xl font-bold text-white mt-0.5 tracking-tight truncate">
              {campus ? campus.name : "Free Franchise"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-red/15 text-pgc-red flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Roster Status</p>
            <p className="font-display text-lg lg:text-xl font-bold text-pgc-emerald mt-0.5 tracking-tight flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-pgc-emerald" />
              <span>Official Roster</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-emerald/15 text-pgc-emerald flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 4. Secondary Card: Appointed Captain Showcase Card ──── */}
      {captain && (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-pgc-gold/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            {captain.avatar_url ? (
              <img
                src={captain.avatar_url}
                alt={captain.full_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-pgc-gold/80 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-pgc-gold/20 text-pgc-gold flex items-center justify-center font-display font-black text-xl shrink-0 border border-pgc-gold/40">
                <Crown className="w-8 h-8" />
              </div>
            )}
            <div className="space-y-1 font-sans">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-pgc-gold/20 border border-pgc-gold/40 text-pgc-gold text-[10px] font-mono font-bold tracking-wider uppercase">
                  APPOINTED CAPTAIN
                </span>
                {captain.ign && (
                  <span className="text-xs font-mono font-bold text-pgc-gold">#{captain.ign}</span>
                )}
              </div>
              <h3 className="font-display font-black text-xl text-white tracking-tight">
                {captain.full_name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Roll No: {captain.roll_number}</p>
            </div>
          </div>

          <Link
            href={`/admin/users/${captain.id}`}
            className="px-4 py-2.5 rounded-xl bg-pgc-gold/15 hover:bg-pgc-gold/25 border border-pgc-gold/40 text-xs font-bold text-pgc-gold transition-colors shrink-0 text-center font-sans"
          >
            Manage Captain Profile
          </Link>
        </div>
      )}

      {/* ── 5. Sortable & Searchable Active Squad Roster Table ── */}
      <DetailStudentTable
        students={teamMembers}
        title="Active Squad Roster"
        emptyMessage="No active players assigned to this squad yet."
        showTeamColumn={false}
      />
    </div>
  );
}
