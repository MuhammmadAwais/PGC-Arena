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
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import { getCampusesData } from "@/features/campus/actions/campusActions";

interface CampusDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampusDetailPage({ params }: CampusDetailPageProps) {
  const { id } = await params;
  const { campuses, allMembers, allTeams } = await getCampusesData();

  const campus = campuses.find((c) => c.id === id);
  if (!campus) {
    notFound();
  }

  // Filter campus-specific data
  const campusTeams = allTeams.filter((t) => t.campus_id === campus.id);
  const campusMembers = allMembers.filter((m) => m.campus_id === campus.id);
  const campusManager = campusMembers.find((m) => m.role === "CAMPUS_MANAGER");
  const campusTeachers = campusMembers.filter((m) => m.role === "TEACHER");
  const campusStudents = campusMembers.filter((m) => m.role === "STUDENT");

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
            ID: {campus.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* ── 2. Campus Hero Master Banner ────────────────────────── */}
      <div className="relative rounded-3xl border border-white/10 bg-[#0B0C16] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Full-width banner background */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-gradient-to-r from-pgc-indigo via-pgc-navy to-[#0B0C16]">
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
        <div className="relative px-6 sm:px-8 pb-8 -mt-20 sm:-mt-24 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-end gap-5">
            {/* Campus Logo Emblem */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-black/90 border-2 border-white/20 p-2 shadow-2xl flex items-center justify-center shrink-0 backdrop-blur-md overflow-hidden">
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
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-pgc-red/20 border border-pgc-red/40 text-pgc-red text-[10px] font-mono font-bold tracking-wider uppercase">
                  PGC FRANCHISE
                </span>
                {campus.region && (
                  <span className="flex items-center gap-1 text-xs text-slate-300 font-sans font-medium">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{campus.region} Region</span>
                  </span>
                )}
              </div>
              <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
                {campus.name}
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Official Punjab Group of Colleges regional esports &amp; academic competition division.
              </p>
            </div>
          </div>

          {/* ELO Standing Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-black/60 border border-pgc-gold/30 backdrop-blur-md text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-display tracking-wider">
                Combined ELO Points
              </span>
              <span className="font-display font-black text-xl text-pgc-gold flex items-center justify-end gap-1.5">
                <Trophy className="w-4 h-4 text-pgc-gold" />
                {totalElo} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Quick KPI Counters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/[0.08] bg-white/[0.02] divide-x divide-white/[0.06]">
          <div className="p-4 px-6 text-center sm:text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Active Squads</p>
            <p className="font-display font-black text-xl text-white mt-0.5">{campusTeams.length}</p>
          </div>
          <div className="p-4 px-6 text-center sm:text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Faculty Coaches</p>
            <p className="font-display font-black text-xl text-purple-400 mt-0.5">{campusTeachers.length}</p>
          </div>
          <div className="p-4 px-6 text-center sm:text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Enrolled Students</p>
            <p className="font-display font-black text-xl text-cyan-400 mt-0.5">{campusStudents.length}</p>
          </div>
          <div className="p-4 px-6 text-center sm:text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Campus Manager</p>
            <p className="font-display font-bold text-sm text-white truncate mt-1">
              {campusManager ? campusManager.full_name : "Unassigned"}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Campus Leadership & Faculty Section ───────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span>Campus Leadership &amp; Faculty</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Manager Profile Card */}
          {campusManager && (
            <Link
              href={`/admin/users/${campusManager.id}`}
              className="p-4 rounded-2xl bg-[#0B0C16] border border-cyan-500/30 hover:border-cyan-400/60 transition-all flex items-center gap-3.5 group shadow-sm"
            >
              {campusManager.avatar_url ? (
                <img
                  src={campusManager.avatar_url}
                  alt={campusManager.full_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-display font-black text-sm shrink-0 border border-cyan-500/30">
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

          {/* Teacher Profile Cards */}
          {campusTeachers.map((teacher) => (
            <Link
              key={teacher.id}
              href={`/admin/users/${teacher.id}`}
              className="p-4 rounded-2xl bg-[#0B0C16] border border-white/10 hover:border-purple-400/50 transition-all flex items-center gap-3.5 group shadow-sm"
            >
              {teacher.avatar_url ? (
                <img
                  src={teacher.avatar_url}
                  alt={teacher.full_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-400/60 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-display font-black text-sm shrink-0 border border-purple-500/30">
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

      {/* ── 4. Esports Squads Section ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-pgc-red" />
            <span>Competitive Esports Squads ({campusTeams.length})</span>
          </h2>
        </div>

        {campusTeams.length === 0 ? (
          <div className="p-12 rounded-2xl border border-white/10 bg-white/[0.01] text-center text-slate-400 font-sans text-xs">
            No active squads registered for this campus yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {campusTeams.map((team, idx) => (
              <div
                key={team.id}
                className="rounded-2xl border border-white/10 bg-[#0B0C16] hover:border-white/20 transition-all flex flex-col justify-between overflow-hidden shadow-lg group"
              >
                {/* Team Banner */}
                <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-[#171638] to-[#0B0C16]">
                  {team.banner_url ? (
                    <img
                      src={team.banner_url}
                      alt={team.name}
                      className="w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/[0.03]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C16] via-black/40 to-transparent" />

                  {/* Header Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 border border-white/10 font-display font-black text-[10px] uppercase tracking-wider text-white">
                      SQUAD #{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-black/70 border border-pgc-gold/40 font-display font-black text-xs text-pgc-gold flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-pgc-gold" />
                      {team.elo_rating} PTS
                    </span>
                  </div>

                  {/* Team Logo */}
                  <div className="absolute -bottom-3 left-4">
                    <div className="w-12 h-12 rounded-xl bg-black/90 border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-xl">
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <Flame className="w-6 h-6 text-pgc-red" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Details */}
                <div className="p-5 pt-6 space-y-4">
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-white tracking-tight">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5 font-medium">
                      {team.members.length} Squad Players
                    </p>
                  </div>

                  {/* Captain Block */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {team.leader?.avatar_url ? (
                        <img
                          src={team.leader.avatar_url}
                          alt={team.leader.full_name}
                          className="w-7 h-7 rounded-full object-cover border-2 border-pgc-gold shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-pgc-gold/20 flex items-center justify-center text-pgc-gold shrink-0">
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 block font-display">
                          Team Captain
                        </span>
                        <span className="font-bold text-sm text-white truncate block">
                          {team.leader ? team.leader.full_name : "Unassigned"}
                        </span>
                      </div>
                    </div>
                    {team.leader?.ign && (
                      <span className="px-2 py-0.5 rounded bg-white/[0.08] text-xs font-mono text-pgc-gold font-bold">
                        #{team.leader.ign}
                      </span>
                    )}
                  </div>

                  {/* Roster List */}
                  <div className="space-y-1.5 font-sans">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Active Players:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {team.members.map((member) => (
                        <Link
                          key={member.id}
                          href={`/admin/users/${member.id}`}
                          className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                            member.is_team_leader
                              ? "bg-pgc-gold/10 text-pgc-gold border-pgc-gold/30 hover:border-pgc-gold"
                              : "bg-white/[0.04] text-slate-300 border-white/[0.08] hover:border-white/20"
                          }`}
                        >
                          <span>{member.full_name}</span>
                          {member.ign && (
                            <span className="text-slate-400 text-[11px] font-mono">({member.ign})</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Link to Squad Management */}
                <div className="p-4 pt-0">
                  <Link
                    href={`/admin/teams/${team.id}`}
                    className="block w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-center text-xs font-bold text-white transition-colors font-sans"
                  >
                    Manage Squad
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. Enrolled Students Directory Table ─────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Enrolled Students &amp; Esports Players ({campusStudents.length})</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B0C16] overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white/[0.02] border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4 font-sans">Student Name</th>
                <th className="py-3.5 px-4 font-sans">In-Game Name (IGN)</th>
                <th className="py-3.5 px-4 font-sans">Roll Number</th>
                <th className="py-3.5 px-4 font-sans">Assigned Squad</th>
                <th className="py-3.5 px-4 font-sans">Role / Status</th>
                <th className="py-3.5 px-4 text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {campusStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    No students enrolled in this campus yet.
                  </td>
                </tr>
              ) : (
                campusStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {stu.avatar_url ? (
                          <img src={stu.avatar_url} alt={stu.full_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center">
                            {stu.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white text-sm">{stu.full_name}</p>
                          <p className="text-[11px] text-slate-400">{stu.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-pgc-gold">
                      {stu.ign ? `#${stu.ign}` : <span className="text-slate-500 font-sans italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {stu.roll_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {stu.team_name ? (
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-pgc-red" />
                          <span>{stu.team_name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned Reserve</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {stu.is_team_leader ? (
                        <span className="px-2 py-0.5 rounded bg-pgc-gold/15 text-pgc-gold border border-pgc-gold/30 font-bold text-[11px]">
                          👑 Captain
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[11px]">
                          Player
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/users/${stu.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-colors"
                      >
                        <span>Manage Student</span>
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
