import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  Flame,
  GraduationCap,
  Users,
  Trophy,
  Crown,
  Shield,
  MapPin,
} from "lucide-react";
import { getSingleCampusData } from "@/features/campus/actions/campusActions";
import { DetailStudentTable } from "@/features/campus/components/DetailStudentTable";

interface CampusDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampusDetailPage({ params }: CampusDetailPageProps) {
  const { id } = await params;
  const data = await getSingleCampusData(id);

  if (!data || !data.campus) {
    notFound();
  }

  const { campus, manager: campusManager, teachers: campusTeachers, teams: campusTeams, students: campusStudents } = data;

  // Calculate total campus points
  const totalElo = campusTeams.reduce((sum, t) => sum + (t.elo_rating ?? 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ── 1. Top Breadcrumbs Navigation ───────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/campuses"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors group font-sans"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          <span>Back to Campuses &amp; Squads</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-300">
            CAMPUS ID: {campus.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* ── 2. Campus Hero Master Banner (Top Featured) ────────── */}
      <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
        {/* Full-width banner background */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-r from-pgc-indigo/60 via-pgc-navy/80 to-black/60">
          {campus.banner_url ? (
            <img
              src={campus.banner_url}
              alt={campus.name}
              className="w-full h-full object-cover opacity-35"
            />
          ) : (
            <div className="w-full h-full bg-white/[0.02]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C16] via-[#0B0C16]/60 to-transparent" />
        </div>

        {/* Hero Info Overlay */}
        <div className="relative px-6 sm:px-8 pb-7 -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-end gap-5">
            {/* Campus Logo Emblem */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-black/90 border-2 border-white/20 p-2 shadow-2xl flex items-center justify-center shrink-0 backdrop-blur-md overflow-hidden">
              {campus.logo_url ? (
                <img
                  src={campus.logo_url}
                  alt={campus.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-10 h-10 text-pgc-red" />
              )}
            </div>

            {/* Title & Regional Tag */}
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-pgc-red/20 border border-pgc-red/40 text-pgc-red text-[10px] font-mono font-bold tracking-wider uppercase">
                  PGC FRANCHISE
                </span>
                {campus.region && (
                  <span className="flex items-center gap-1 text-xs text-slate-300 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{campus.region} Region</span>
                  </span>
                )}
              </div>
              <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
                {campus.name}
              </h1>
              <p className="text-xs text-slate-400">
                Official Punjab Group of Colleges regional esports &amp; academic competition division.
              </p>
            </div>
          </div>

          {/* Regional Manager Preview */}
          <div className="p-3 px-4 rounded-2xl bg-black/40 border border-white/[0.08] backdrop-blur-md flex items-center gap-3 shrink-0 font-sans">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">
                Campus Manager
              </span>
              <span className="text-xs font-bold text-white">
                {campusManager ? campusManager.full_name : "Unassigned"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Row 1: Primary Summary Stats Overview Cards (4 Cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Active Squads</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-white mt-0.5 tracking-tight">{campusTeams.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-red/15 text-pgc-red flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Combined ELO</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-pgc-gold mt-0.5 tracking-tight">{totalElo} PTS</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-gold/15 text-pgc-gold flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Faculty Coaches</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-purple-400 mt-0.5 tracking-tight">{campusTeachers.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Enrolled Students</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-cyan-400 mt-0.5 tracking-tight">{campusStudents.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 4. Row 2: Floating Borderless Cards with Glowing Underlines (Faculty & Leadership) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Campus Leadership &amp; Faculty Coaches</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* Manager Floating Underline Card */}
          {campusManager && (
            <Link
              href={`/admin/users/${campusManager.id}`}
              className="group relative p-4 rounded-2xl bg-gradient-to-b from-white/[0.03] via-cyan-500/[0.02] to-cyan-500/[0.06] border-b-2 border-cyan-400 shadow-[0_6px_20px_-4px_rgba(6,182,212,0.25)] hover:shadow-[0_12px_28px_-4px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md flex items-center gap-3.5"
            >
              {campusManager.avatar_url ? (
                <img
                  src={campusManager.avatar_url}
                  alt={campusManager.full_name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-cyan-400 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-display font-black text-xs shrink-0 border border-cyan-500/30">
                  MGR
                </div>
              )}
              <div className="min-w-0 font-sans">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block font-display">
                  Campus Manager
                </span>
                <p className="font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                  {campusManager.full_name}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{campusManager.roll_number}</p>
              </div>
            </Link>
          )}

          {/* Teacher Floating Underline Cards */}
          {campusTeachers.map((teacher) => (
            <Link
              key={teacher.id}
              href={`/admin/users/${teacher.id}`}
              className="group relative p-4 rounded-2xl bg-gradient-to-b from-white/[0.03] via-purple-500/[0.02] to-purple-500/[0.06] border-b-2 border-purple-400 shadow-[0_6px_20px_-4px_rgba(168,85,247,0.25)] hover:shadow-[0_12px_28px_-4px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md flex items-center gap-3.5"
            >
              {teacher.avatar_url ? (
                <img
                  src={teacher.avatar_url}
                  alt={teacher.full_name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-purple-400 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-display font-black text-xs shrink-0 border border-purple-500/30">
                  TCH
                </div>
              )}
              <div className="min-w-0 font-sans">
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block font-display">
                  Faculty Coach
                </span>
                <p className="font-bold text-sm text-white truncate group-hover:text-purple-300 transition-colors">
                  {teacher.full_name}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{teacher.roll_number}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 5. Secondary Card: Esports Squads Section ───────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-pgc-red" />
            <span>Competitive Esports Squads ({campusTeams.length})</span>
          </h2>
        </div>

        {campusTeams.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 text-center text-xs text-slate-400 font-sans">
            No active squads registered for this campus yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campusTeams.map((team, idx) => (
              <div
                key={team.id}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.18] transition-all flex flex-col justify-between overflow-hidden shadow-sm backdrop-blur-md group"
              >
                {/* Team Banner Header */}
                <div className="relative h-24 w-full overflow-hidden bg-gradient-to-r from-pgc-indigo to-black/80">
                  {team.banner_url ? (
                    <img
                      src={team.banner_url}
                      alt={team.name}
                      className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/[0.02]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 font-display font-black text-[10px] uppercase text-white">
                      SQUAD #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-pgc-gold/30 font-display font-black text-xs text-pgc-gold flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {team.elo_rating ?? 1000} PTS
                    </span>
                  </div>

                  {/* Emblem */}
                  <div className="absolute -bottom-3 left-4">
                    <div className="w-12 h-12 rounded-xl bg-black/90 border-2 border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <Flame className="w-6 h-6 text-pgc-red" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 pt-5 space-y-3.5">
                  <div>
                    <Link
                      href={`/admin/teams/${team.id}`}
                      className="font-display font-black text-lg text-white hover:text-pgc-red transition-colors block"
                    >
                      {team.name}
                    </Link>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {team.member_count} Squad Members Enrolled
                    </p>
                  </div>

                  {/* Captain Card */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {team.leader?.avatar_url ? (
                        <img
                          src={team.leader.avatar_url}
                          alt={team.leader.full_name}
                          className="w-7 h-7 rounded-full object-cover border-2 border-pgc-gold/80 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-pgc-gold/20 flex items-center justify-center text-pgc-gold shrink-0">
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">
                          Team Captain
                        </span>
                        {team.leader ? (
                          <Link
                            href={`/admin/users/${team.leader.id}`}
                            className="font-bold text-sm text-white hover:text-pgc-gold transition-colors truncate block"
                          >
                            {team.leader.full_name}
                          </Link>
                        ) : (
                          <span className="font-bold text-sm text-slate-500 block">Unassigned</span>
                        )}
                      </div>
                    </div>
                    {team.leader?.ign && (
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-xs font-mono text-pgc-gold font-bold">
                        #{team.leader.ign}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Link */}
                <div className="p-4 pt-0">
                  <Link
                    href={`/admin/teams/${team.id}`}
                    className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors block text-center font-sans"
                  >
                    Manage Squad Roster
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 6. Sortable & Searchable Students Directory Table ── */}
      <DetailStudentTable
        students={campusStudents}
        title="Enrolled Students & Players"
        emptyMessage="No student players currently enrolled in this campus branch."
        showTeamColumn={true}
      />
    </div>
  );
}
