"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Edit3,
  UserPlus,
  Plus,
} from "lucide-react";
import { DetailStudentTable } from "./DetailStudentTable";
import { EditCampusModal } from "./EditCampusModal";
import { CreateTeamModal } from "./CreateTeamModal";
import { AddMemberModal } from "./AddMemberModal";

interface CampusDetailViewProps {
  campus: {
    id: string;
    name: string;
    region?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
  };
  manager: any;
  teachers: any[];
  teams: any[];
  students: any[];
  allManagers: any[];
  allCandidateStudents: any[];
  allCampuses: any[];
  allTeams: any[];
}

export function CampusDetailView({
  campus,
  manager,
  teachers,
  teams,
  students,
  allManagers,
  allCandidateStudents,
  allCampuses,
  allTeams,
}: CampusDetailViewProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  // Total Campus Points
  const totalElo = teams.reduce((sum, t) => sum + (t.elo_rating ?? 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── 1. Top Breadcrumbs Navigation & Actions ──────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/campuses"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          <span>Back to Campuses &amp; Squads</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Edit Campus</span>
          </button>

          <button
            onClick={() => setIsCreateTeamOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pgc-red text-white text-xs font-bold hover:bg-pgc-hover transition-all active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(227,59,41,0.25)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Squad</span>
          </button>
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
            <div className="space-y-1.5">
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

          {/* Regional Manager Card Trigger */}
          <div className="p-3 px-4 rounded-2xl bg-black/50 border border-white/[0.1] backdrop-blur-md flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">
                Campus Manager
              </span>
              {manager ? (
                <Link
                  href={`/admin/users/${manager.id}`}
                  className="text-xs font-bold text-white hover:text-cyan-300 transition-colors"
                >
                  {manager.full_name}
                </Link>
              ) : (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>+ Appoint Manager</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Row 1: Primary Summary Stats Overview Cards (4 Cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Squads</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-white mt-0.5 tracking-tight">
              {teams.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-red/15 text-pgc-red flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Combined ELO</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-pgc-gold mt-0.5 tracking-tight">
              {totalElo} PTS
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-gold/15 text-pgc-gold flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty Coaches</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-purple-400 mt-0.5 tracking-tight">
              {teachers.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-cyan-400 mt-0.5 tracking-tight">
              {students.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 4. Row 2: Floating Borderless Cards with Glowing Underlines ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Campus Leadership &amp; Faculty Coaches</span>
          </h2>
          {!manager && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Appoint Manager</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* Manager Floating Underline Card */}
          {manager ? (
            <Link
              href={`/admin/users/${manager.id}`}
              className="group relative p-4 rounded-2xl bg-gradient-to-b from-white/[0.03] via-cyan-500/[0.02] to-cyan-500/[0.06] border-b-2 border-cyan-400 shadow-[0_6px_20px_-4px_rgba(6,182,212,0.25)] hover:shadow-[0_12px_28px_-4px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md flex items-center gap-3.5"
            >
              {manager.avatar_url ? (
                <img
                  src={manager.avatar_url}
                  alt={manager.full_name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-cyan-400 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-display font-black text-xs shrink-0 border border-cyan-500/30">
                  MGR
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block font-display">
                  Campus Manager
                </span>
                <p className="font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                  {manager.full_name}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{manager.roll_number}</p>
              </div>
            </Link>
          ) : (
            <div
              onClick={() => setIsEditModalOpen(true)}
              className="p-4 rounded-2xl bg-white/[0.01] hover:bg-cyan-500/[0.03] border-b-2 border-dashed border-cyan-400/40 hover:border-cyan-400 transition-all cursor-pointer flex items-center gap-3.5 text-slate-400 hover:text-cyan-300"
            >
              <div className="w-11 h-11 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">No Manager Appointed</p>
                <p className="text-[10px] text-cyan-400 font-medium">Click to appoint leadership</p>
              </div>
            </div>
          )}

          {/* Teacher Floating Underline Cards */}
          {teachers.map((teacher) => (
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
              <div className="min-w-0">
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
            <span>Competitive Esports Squads ({teams.length})</span>
          </h2>
          <button
            onClick={() => setIsCreateTeamOpen(true)}
            className="text-xs text-pgc-red hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Squad</span>
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 text-center text-xs text-slate-400">
            No active squads registered for this campus yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team, idx) => (
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
                      {team.elo_rating ?? 0} PTS
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
                    <p className="text-xs text-slate-400 mt-0.5">
                      {team.member_count} Squad Members Enrolled
                    </p>
                  </div>

                  {/* Captain Card */}
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

      {/* ── 6. Sortable & Searchable Students Directory Table ── */}
      <DetailStudentTable
        students={students}
        title="Enrolled Students & Players"
        emptyMessage="No student players currently enrolled in this campus branch."
        showTeamColumn={true}
        campusId={campus.id}
        allCampuses={allCampuses}
        allTeams={allTeams}
        allCandidateStudents={allCandidateStudents}
        onRefresh={() => router.refresh()}
      />

      {/* ── Edit Campus Modal ────────────────────────────────────── */}
      <EditCampusModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        campus={campus}
        currentManagerId={manager?.id}
        availableManagers={allManagers}
        onSuccess={() => router.refresh()}
      />

      {/* ── Create Squad Modal ──────────────────────────────────── */}
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onOpenChange={setIsCreateTeamOpen}
        campuses={allCampuses}
        allStudents={allCandidateStudents}
        defaultCampusId={campus.id}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
