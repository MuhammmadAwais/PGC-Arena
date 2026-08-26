"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CampusItem } from "../types/campusTypes";

interface CampusHierarchyViewProps {
  campuses: CampusItem[];
  onSelectCampus: (campus: CampusItem) => void;
  onCreateTeamForCampus: (campus: CampusItem) => void;
  onAddMemberForCampus: (campus: CampusItem) => void;
  onToggleStarCampus: (campusId: string) => void;
}

export function CampusHierarchyView({
  campuses,
  onSelectCampus,
  onCreateTeamForCampus,
  onAddMemberForCampus,
  onToggleStarCampus,
}: CampusHierarchyViewProps) {
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

  return (
    <div className="flex flex-col gap-4">
      {campuses.map((campus, idx) => {
        const isExpanded = Boolean(expandedCampuses[campus.id]);

        return (
          <div
            key={campus.id}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md hover:border-white/[0.14] transition-all duration-200 overflow-hidden"
          >
            {/* ── 1. Campus Master Header (Unified Frosted Glass Row with Left Banner) ── */}
            <div
              onClick={() => toggleExpand(campus.id)}
              className="relative px-6 py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-white/[0.04] overflow-hidden group"
            >
              {/* Full-Width Campus Banner with Seamless Ambient Gradient Overlay */}
              {campus.banner_url && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <img
                    src={campus.banner_url}
                    alt=""
                    className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C16]/50 via-[#0B0C16]/80 to-[#0B0C16]/95 backdrop-blur-[1px]" />
                </div>
              )}

              {/* Left Zone: Star, Campus Avatar / Crest, Name & Leadership */}
              <div className="relative z-10 flex items-center gap-4 min-w-0">
                {/* Favorite Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStarCampus(campus.id);
                  }}
                  className="p-1.5 rounded-lg text-white/30 hover:text-pgc-gold transition-colors cursor-pointer shrink-0"
                  title="Star Campus"
                >
                  <Star
                    className={`w-4 h-4 ${
                      campus.isStarred ? "text-pgc-gold fill-pgc-gold" : "text-white/30"
                    }`}
                  />
                </button>

                {/* Campus Crest / Avatar */}
                <div className="relative w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {campus.logo_url ? (
                    <img
                      src={campus.logo_url}
                      alt={campus.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-white/80" />
                  )}
                </div>

                {/* Campus Title & Leadership */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-display font-black text-pgc-red/90 uppercase tracking-widest">
                      #{idx + 1}
                    </span>
                    <h3 className="font-display text-lg lg:text-xl font-extrabold text-white tracking-tight truncate">
                      {campus.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-sans">
                    <span>Region: <strong className="text-slate-200 font-semibold">{campus.region}</strong></span>
                    <span className="text-white/20">•</span>
                    <span>Manager: <strong className="text-slate-200 font-semibold">{campus.manager ? campus.manager.full_name : "Unassigned"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Zone: Clean Tabular Metric Counters & Action Chevron */}
              <div
                className="relative z-10 flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Tabular KPIs */}
                <div className="flex items-center gap-6 text-xs font-sans">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Squads</p>
                    <p className="font-display font-black text-base lg:text-lg text-white">{campus.teams.length}</p>
                  </div>

                  <div className="h-6 w-px bg-white/10" />

                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Faculty</p>
                    <p className="font-display font-black text-base lg:text-lg text-white">{campus.teachers.length}</p>
                  </div>

                  <div className="h-6 w-px bg-white/10" />

                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Students</p>
                    <p className="font-display font-black text-base lg:text-lg text-white">{campus.students.length}</p>
                  </div>
                </div>

                {/* Action Menu & Expand Chevron */}
                <div className="flex items-center gap-2 pl-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors cursor-pointer"
                      title="Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1.5">
                      <DropdownMenuLabel>Campus Quick Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onCreateTeamForCampus(campus)}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4 text-pgc-red" />
                        <span>Add Esports Squad</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onAddMemberForCampus(campus)}
                        className="gap-2"
                      >
                        <UserPlus className="w-4 h-4 text-pgc-emerald" />
                        <span>Add Member / Player</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onSelectCampus(campus)}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                        <span>View Command Sheet</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button
                    onClick={() => toggleExpand(campus.id)}
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors cursor-pointer"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                    <button
                      onClick={() => onSelectCampus(campus)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer font-sans"
                    >
                      <span>Command Sheet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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
                      No active squads found for this campus.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {campus.teams.map((team, tIdx) => (
                        <div
                          key={team.id}
                          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.18] transition-all flex flex-col justify-between overflow-hidden shadow-sm group"
                        >
                          {/* ── Team Banner Header with Overlay ──── */}
                          <div className="relative h-24 w-full overflow-hidden bg-gradient-to-r from-[#171638] to-[#0B0C16]">
                            {team.banner_url ? (
                              <img
                                src={team.banner_url}
                                alt={team.name}
                                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/[0.03]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C16] via-black/40 to-transparent" />

                            {/* Top Position & ELO Badge Overlay */}
                            <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-xs">
                              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 font-display font-black text-[10px] uppercase tracking-wider text-white">
                                SQUAD #{tIdx + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-pgc-gold/30 font-display font-black text-xs text-pgc-gold flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                {team.elo_rating} PTS
                              </span>
                            </div>

                            {/* Team Logo Emblem (Positioned on lower edge of banner) */}
                            <div className="absolute -bottom-3 left-4 flex items-end gap-3">
                              <div className="w-12 h-12 rounded-xl bg-black/80 border-2 border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
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

                          {/* ── Card Body (Below Banner) ──────────── */}
                          <div className="p-4 pt-5 space-y-3.5">
                            {/* Team Title */}
                            <div>
                              <h5 className="font-display font-extrabold text-lg lg:text-xl text-white tracking-tight">
                                {team.name}
                              </h5>
                              <p className="text-xs text-slate-400 font-sans mt-0.5 font-medium">
                                {team.members.length} Squad Members Enrolled
                              </p>
                            </div>

                            {/* Captain Block with Headshot Avatar */}
                            <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between text-xs">
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
                                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block font-display tracking-wider">
                                    Team Captain
                                  </span>
                                  <span className="font-bold text-sm text-white truncate block">
                                    {team.leader ? team.leader.full_name : "Unassigned"}
                                  </span>
                                </div>
                              </div>
                              {team.leader?.ign && (
                                <span className="px-2 py-0.5 rounded bg-white/[0.06] text-xs font-mono text-pgc-gold font-bold">
                                  #{team.leader.ign}
                                </span>
                              )}
                            </div>

                            {/* Active Roster List with Player Headshots */}
                            <div className="space-y-1.5 font-sans">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Active Players:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {team.members.map((member) => (
                                  <span
                                    key={member.id}
                                    className={`inline-flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                      member.is_team_leader
                                        ? "bg-pgc-gold/10 text-pgc-gold border-pgc-gold/30 font-bold"
                                        : "bg-white/[0.03] text-slate-300 border-white/[0.08]"
                                    }`}
                                  >
                                    {member.avatar_url ? (
                                      <img
                                        src={member.avatar_url}
                                        alt={member.full_name}
                                        className="w-4 h-4 rounded-full object-cover"
                                      />
                                    ) : (
                                      <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold">
                                        {member.full_name.charAt(0)}
                                      </span>
                                    )}
                                    <span>{member.full_name}</span>
                                    {member.ign && (
                                      <span className="text-slate-400 text-[11px] font-mono">({member.ign})</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Card Footer: Action Button */}
                          <div className="p-4 pt-0">
                            <button
                              onClick={() => onSelectCampus(campus)}
                              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer font-sans"
                            >
                              Manage Squad
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── C. Faculty & Leadership Section with Headshots ── */}
                <div className="pt-3 border-t border-white/[0.06]">
                  <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span>Faculty &amp; Campus Leadership</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {/* Manager Card */}
                    {campus.manager && (
                      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 flex items-center gap-3">
                        {campus.manager.avatar_url ? (
                          <img
                            src={campus.manager.avatar_url}
                            alt={campus.manager.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-cyan-400/40 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 font-display">
                            MGR
                          </div>
                        )}
                        <div className="min-w-0 font-sans">
                          <p className="text-xs font-bold text-white truncate">{campus.manager.full_name}</p>
                          <p className="text-[11px] text-cyan-400 truncate font-semibold">Campus Manager</p>
                        </div>
                      </div>
                    )}

                    {/* Teachers Cards */}
                    {campus.teachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 flex items-center gap-3"
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
                          <p className="text-xs font-bold text-white truncate">{teacher.full_name}</p>
                          <p className="text-[11px] text-slate-400 truncate font-medium">Faculty / Coach</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
