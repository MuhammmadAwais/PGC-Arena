"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  ChevronLeft,
  Building2,
  Trophy,
  Crown,
  Users,
  Shield,
  Edit3,
  UserPlus,
  Plus,
} from "lucide-react";
import { DetailStudentTable } from "./DetailStudentTable";
import { EditTeamModal } from "./EditTeamModal";
import { AssignStudentModal } from "./AssignStudentModal";
import { AddMemberModal } from "./AddMemberModal";

interface TeamDetailViewProps {
  team: {
    id: string;
    name: string;
    campus_id: string;
    leader_id?: string | null;
    elo_rating?: number | null;
    logo_url?: string | null;
    banner_url?: string | null;
  };
  campus: any;
  leader: any;
  members: any[];
  allCampuses: any[];
  allCandidateStudents: any[];
  allTeams: any[];
}

export function TeamDetailView({
  team,
  campus,
  leader,
  members,
  allCampuses,
  allCandidateStudents,
  allTeams,
}: TeamDetailViewProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── 1. Top Breadcrumbs Navigation & Actions ──────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href={campus ? `/admin/campuses/${campus.id}` : "/admin/campuses"}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          <span>Back to {campus ? campus.name : "Campuses & Squads"}</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-pgc-gold" />
            <span>Edit Squad</span>
          </button>

          <button
            onClick={() => setIsDraftModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pgc-red text-white text-xs font-bold hover:bg-pgc-hover transition-all active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(227,59,41,0.25)]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Draft Player</span>
          </button>
        </div>
      </div>

      {/* ── 2. Squad Hero Banner Card (Top Featured) ─────────────── */}
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
            <div className="space-y-1.5">
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
          <div className="p-3 px-4 rounded-2xl bg-black/50 border border-pgc-gold/30 backdrop-blur-md flex items-center gap-3 shrink-0">
            {leader?.avatar_url ? (
              <img src={leader.avatar_url} alt={leader.full_name} className="w-9 h-9 rounded-full object-cover border border-pgc-gold" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-pgc-gold/20 text-pgc-gold flex items-center justify-center font-bold text-xs">
                <Crown className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold text-pgc-gold uppercase tracking-wider block font-display">
                Squad Captain
              </span>
              {leader ? (
                <Link
                  href={`/admin/users/${leader.id}`}
                  className="text-xs font-bold text-white hover:text-pgc-gold transition-colors block"
                >
                  {leader.full_name}
                </Link>
              ) : (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-bold text-pgc-gold hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>+ Appoint Captain</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Primary Summary Stats Overview Cards (Below Banner) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Competitive ELO</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-pgc-gold mt-0.5 tracking-tight">
              {team.elo_rating ?? 0} PTS
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-gold/15 text-pgc-gold flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Squad Size</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-cyan-400 mt-0.5 tracking-tight">
              {members.length} Players
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Affiliation</p>
            <p className="font-display text-base lg:text-lg font-black text-white mt-0.5 tracking-tight truncate max-w-[160px]">
              {campus ? campus.name : "Independent"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 text-slate-300 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tournament Status</p>
            <p className="font-display text-base lg:text-lg font-black text-emerald-400 mt-0.5 tracking-tight">
              Match Ready
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 4. Sortable & Searchable Squad Roster Table ─────────── */}
      <DetailStudentTable
        students={members}
        title="Active Squad Roster & Players"
        emptyMessage="No student players currently assigned to this squad. Click 'Draft Player' above."
        showTeamColumn={false}
        teamId={team.id}
        campusId={campus?.id}
        allCampuses={allCampuses}
        allTeams={allTeams}
        allCandidateStudents={allCandidateStudents}
        onRefresh={() => router.refresh()}
      />

      {/* ── Edit Team Modal ────────────────────────────────────── */}
      <EditTeamModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        team={team}
        campuses={allCampuses}
        availableStudents={allCandidateStudents}
        onSuccess={() => router.refresh()}
      />

      {/* ── Draft Player to Squad Modal ────────────────────────── */}
      <AssignStudentModal
        isOpen={isDraftModalOpen}
        onOpenChange={setIsDraftModalOpen}
        targetType="team"
        targetId={team.id}
        targetName={team.name}
        availableStudents={allCandidateStudents}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
