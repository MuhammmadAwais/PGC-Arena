"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  GraduationCap,
  Crown,
  ChevronDown,
  ChevronUp,
  Plus,
  Star,
  Trophy,
  ExternalLink,
  Flame,
  UserPlus,
  MoreVertical,
  ArrowRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CampusItem, MemberItem, TeamItem } from "../types/campusTypes";

interface CampusHierarchyViewProps {
  campuses: CampusItem[];
  onSelectCampus: (campus: CampusItem) => void;
  onCreateTeamForCampus: (campus: CampusItem) => void;
  onAddStudentForCampus?: (campus: CampusItem) => void;
  onAddMemberForCampus: (campus: CampusItem) => void;
  onToggleStarCampus: (campusId: string) => void;
  onDeleteCampus?: (campus: CampusItem) => void;
  onDeleteTeam?: (team: TeamItem) => void;
  onDeleteMember?: (member: { id: string; full_name: string }, type: string) => void;
}

export function CampusHierarchyView({
  campuses,
  onSelectCampus,
  onCreateTeamForCampus,
  onAddStudentForCampus,
  onAddMemberForCampus,
  onToggleStarCampus,
  onDeleteCampus,
  onDeleteTeam,
  onDeleteMember,
}: CampusHierarchyViewProps) {
  const router = useRouter();

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(campuses.length / pageSize));
  const paginatedCampuses = useMemo(() => {
    const start = pageIndex * pageSize;
    return campuses.slice(start, start + pageSize);
  }, [campuses, pageIndex, pageSize]);

  // Expanded state per campus
  const [expandedCampuses, setExpandedCampuses] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (campuses.length > 0) {
      initial[campuses[0].id] = true;
    }
    return initial;
  });

  const toggleExpand = (campusId: string) => {
    setExpandedCampuses((prev) => ({ ...prev, [campusId]: !prev[campusId] }));
  };

  if (campuses.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3">
        <Building2 className="w-10 h-10 text-white/20" />
        <p className="font-display text-base font-extrabold text-white/80 tracking-wide">
          No campuses found matching current filters.
        </p>
        <p className="text-xs text-slate-400 font-sans">
          Try clearing your search query or resetting filters.
        </p>
      </div>
    );
  }

  const startRecord = pageIndex * pageSize + 1;
  const endRecord = Math.min((pageIndex + 1) * pageSize, campuses.length);

  return (
    <div className="flex flex-col gap-4">
      {paginatedCampuses.map((campus, idx) => {
        const isExpanded = Boolean(expandedCampuses[campus.id]);

        return (
          <div
            key={campus.id}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md hover:border-white/[0.14] transition-all duration-200 overflow-hidden"
          >
            {/* ── 1. Campus Master Header ─────────────────────────── */}
            <div
              onClick={() => toggleExpand(campus.id)}
              className="relative px-6 py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-white/[0.04] overflow-hidden group"
            >
              {/* Full-Width Campus Banner */}
              {campus.banner_url && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <img
                    src={campus.banner_url}
                    alt={campus.name}
                    className="w-full h-full object-cover opacity-20 group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C16] via-[#0B0C16]/80 to-transparent" />
                </div>
              )}

              {/* Left Identity: Star + Emblem + Title + Region */}
              <div className="relative flex items-center gap-4 z-10 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStarCampus(campus.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    campus.isStarred
                      ? "text-pgc-gold hover:text-amber-300"
                      : "text-white/20 hover:text-white/60"
                  }`}
                  title={campus.isStarred ? "Starred Campus" : "Star this campus"}
                >
                  <Star
                    className="w-4 h-4"
                    fill={campus.isStarred ? "currentColor" : "none"}
                  />
                </button>

                {/* Campus Emblem */}
                <div className="w-12 h-12 rounded-xl bg-black/80 border border-white/20 flex items-center justify-center p-2 shrink-0 shadow-lg backdrop-blur-md">
                  {campus.logo_url ? (
                    <img
                      src={campus.logo_url}
                      alt={campus.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-pgc-red" />
                  )}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-black text-lg text-white group-hover:text-cyan-300 transition-colors truncate">
                      {campus.name}
                    </span>
                    {campus.region && (
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-300 uppercase tracking-wider">
                        {campus.region}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-sans truncate">
                    {campus.manager ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Head:</span>
                        <span className="text-slate-300 font-semibold">{campus.manager.full_name}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">No Campus Manager Appointed</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Stats & Quick Actions */}
              <div className="relative flex items-center justify-between md:justify-end gap-6 z-10 shrink-0">
                <div className="flex items-center gap-5">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Squads</p>
                    <p className="font-display font-black text-base lg:text-lg text-white">{campus.teams.length}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Faculty</p>
                    <p className="font-display font-black text-base lg:text-lg text-white">{campus.teachers.length}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Students</p>
                    <p className="font-display font-black text-base lg:text-lg text-white">{campus.students.length}</p>
                  </div>
                </div>

                {/* Action Menu & Expand Chevron */}
                <div
                  className="flex items-center gap-2 pl-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors cursor-pointer"
                      title="Campus Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1.5 font-sans z-50">
                      <DropdownMenuLabel>Campus Quick Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onCreateTeamForCampus(campus)}
                        className="gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-pgc-red" />
                        <span>Add Esports Squad</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => (onAddStudentForCampus ? onAddStudentForCampus(campus) : onAddMemberForCampus(campus))}
                        className="gap-2 cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4 text-pgc-red" />
                        <span>Enroll Student Player</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onAddMemberForCampus(campus)}
                        className="gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-pgc-emerald" />
                        <span>Add Faculty / Staff</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/campuses/${campus.id}`)}
                        className="gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                        <span>Manage Campus</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteCampus?.(campus)}
                        className="gap-2 text-pgc-red hover:bg-pgc-red/10 focus:bg-pgc-red/10 focus:text-pgc-red cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-pgc-red" />
                        <span>Delete Campus</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(campus.id);
                    }}
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors cursor-pointer"
                    title={isExpanded ? "Collapse Details" : "Expand Details"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* ── 2. Expanded Campus Content ──────────────────────── */}
            {isExpanded && (
              <div className="p-6 space-y-6">
                {/* ── A. Institutional Exploration Sub-Bar ─────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="font-display text-xs font-black uppercase tracking-wider text-white">
                      EXPLORE {campus.name}
                    </span>
                    <p className="text-xs text-slate-400 font-sans mt-0.5 font-normal">
                      View all competitive squads, faculty leads &amp; enrolled tournament rosters.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onCreateTeamForCampus(campus)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer font-sans"
                    >
                      <Plus className="w-3.5 h-3.5 text-pgc-red" />
                      <span>Add Squad</span>
                    </button>
                    <Link
                      prefetch={true}
                      href={`/admin/campuses/${campus.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer font-sans"
                    >
                      <span>Manage Campus</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* ── B. Squad Cards with Rich Esports Banners & Logos ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-pgc-red" />
                      <span>Esports Squads ({campus.teams.length})</span>
                    </h4>
                  </div>

                  {campus.teams.length === 0 ? (
                    <div className="bg-white/[0.01] border border-white/[0.06] rounded-xl p-6 text-center text-xs text-slate-400 font-sans font-normal">
                      No active squads registered for this campus. Click &quot;Add Squad&quot; above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {campus.teams.map((team, tIdx) => (
                        <div
                          key={team.id}
                          className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.18] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm backdrop-blur-md"
                        >
                          {/* Banner Header */}
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

                            <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-xs">
                              <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 font-display font-black text-[10px] uppercase text-white">
                                SQUAD #{tIdx + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-pgc-gold/30 font-display font-black text-xs text-pgc-gold flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                {team.elo_rating} PTS
                              </span>
                            </div>

                            <div className="absolute -bottom-3 left-4">
                              <div className="w-12 h-12 rounded-xl bg-black/90 border-2 border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                                {team.logo_url ? (
                                  <img
                                    src={team.logo_url}
                                    alt={team.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Flame className="w-6 h-6 text-pgc-red" />
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 pt-5 space-y-3 font-sans">
                            <div className="flex items-start justify-between">
                              <div>
                                <Link
                                  prefetch={true}
                                  href={`/admin/teams/${team.id}`}
                                  className="font-display font-black text-lg text-white hover:text-pgc-red transition-colors block"
                                >
                                  {team.name}
                                </Link>
                                <p className="text-xs text-slate-400 mt-0.5 font-normal">
                                  {team.members.length} Squad Members Enrolled
                                </p>
                              </div>
                              <button
                                onClick={() => onDeleteTeam?.(team)}
                                className="p-1 rounded text-white/20 hover:text-pgc-red hover:bg-pgc-red/10 transition-colors cursor-pointer shrink-0"
                                title="Delete Team"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Captain info */}
                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
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
                                <div className="min-w-0 font-sans">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">
                                    Team Captain
                                  </span>
                                  {team.leader ? (
                                    <Link
                                      prefetch={true}
                                      href={`/admin/users/${team.leader.id}`}
                                      className="font-bold text-sm text-white hover:text-pgc-gold transition-colors truncate block"
                                    >
                                      {team.leader.full_name}
                                    </Link>
                                  ) : (
                                    <span className="font-bold text-sm text-slate-500 block font-sans">Unassigned</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 pt-0 font-sans">
                            <Link
                              prefetch={true}
                              href={`/admin/teams/${team.id}`}
                              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors block text-center"
                            >
                              Manage Squad Roster
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── C. Faculty Coaches Roster ──────────────────────── */}
                <div className="pt-2">
                  <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    <span>Faculty Coaches &amp; Leads ({campus.teachers.length})</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 font-sans">
                    {campus.teachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="group/tch relative p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-400/30 transition-all flex items-center justify-between gap-3"
                      >
                        <Link
                          prefetch={true}
                          href={`/admin/users/${teacher.id}`}
                          className="flex items-center gap-3 min-w-0 flex-1"
                        >
                          {teacher.avatar_url ? (
                            <img
                              src={teacher.avatar_url}
                              alt={teacher.full_name}
                              className="w-9 h-9 rounded-full object-cover border border-purple-400/40 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 font-display">
                              TCH
                            </div>
                          )}
                          <div className="min-w-0 font-sans">
                            <p className="text-xs font-bold text-white truncate group-hover/tch:text-purple-300 transition-colors">{teacher.full_name}</p>
                            <p className="text-[11px] text-slate-400 truncate font-medium">Faculty / Coach</p>
                          </div>
                        </Link>
                        <button
                          onClick={() => onDeleteMember?.(teacher, "teacher")}
                          className="p-1.5 rounded-lg text-white/20 hover:text-pgc-red hover:bg-pgc-red/10 transition-colors cursor-pointer shrink-0 opacity-0 group-hover/tch:opacity-100"
                          title="Delete Teacher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── 3. Bottom Pagination Controls ──────────────────────────── */}
      {campuses.length > 5 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-sans text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing <span className="text-white font-bold">{startRecord}</span> to{" "}
              <span className="text-white font-bold">{endRecord}</span> of{" "}
              <span className="text-white font-bold">{campuses.length}</span> campuses
            </span>

            <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
              <span>Per page:</span>
              {[5, 10, 25].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    setPageIndex(0);
                  }}
                  className={`px-2 py-0.5 rounded-md font-mono text-xs transition-colors cursor-pointer ${
                    pageSize === size
                      ? "bg-white/15 text-white font-bold"
                      : "hover:bg-white/[0.06] text-slate-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs text-white">
              Page {pageIndex + 1} of {totalPages}
            </span>

            <button
              onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
              disabled={pageIndex >= totalPages - 1}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
