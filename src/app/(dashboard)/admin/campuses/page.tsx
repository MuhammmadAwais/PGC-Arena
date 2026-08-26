"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Flame,
  UserPlus,
  Layers,
  LayoutGrid,
  RefreshCw,
  Trophy,
  Crown,
  Users,
  GraduationCap,
} from "lucide-react";

import dynamic from "next/dynamic";
import { useCampusStore } from "@/features/campus/store/useCampusStore";
import type { CampusItem, SavedFilterPreset } from "@/features/campus/types/campusTypes";
import { CampusHierarchyView } from "@/features/campus/components/CampusHierarchyView";
import { GlobalDirectoryView } from "@/features/campus/components/GlobalDirectoryView";
import { CampusFilterBar } from "@/features/campus/components/CampusFilterBar";
import { SavedListsBar } from "@/features/campus/components/SavedListsBar";
import type { DeletableEntityType } from "@/features/campus/components/DeleteConfirmationModal";
import {
  deleteCampusAction,
  deleteTeamAction,
  deleteMemberAction,
} from "@/features/campus/actions/campusActions";

// ── Dynamic Lazy-Loaded Modals (Code-Split for speed) ─────────────
const CreateCampusModal = dynamic(
  () => import("@/features/campus/components/CreateCampusModal").then((m) => m.CreateCampusModal),
  { ssr: false }
);
const CreateTeamModal = dynamic(
  () => import("@/features/campus/components/CreateTeamModal").then((m) => m.CreateTeamModal),
  { ssr: false }
);
const AddStudentModal = dynamic(
  () => import("@/features/campus/components/AddStudentModal").then((m) => m.AddStudentModal),
  { ssr: false }
);
const AddMemberModal = dynamic(
  () => import("@/features/campus/components/AddMemberModal").then((m) => m.AddMemberModal),
  { ssr: false }
);
const DeleteConfirmationModal = dynamic(
  () => import("@/features/campus/components/DeleteConfirmationModal").then((m) => m.DeleteConfirmationModal),
  { ssr: false }
);

export default function CampusesAndTeamsPage() {
  const router = useRouter();

  // ── Persistent Zustand Store (Zero-loss route transitions) ────
  const {
    campuses,
    allMembers,
    allTeams,
    isLoaded,
    isLoading,
    viewMode,
    filters,
    activePresetId,
    starredCampusIds,
    fetchData,
    setViewMode,
    setFilters,
    resetFilters,
    setActivePresetId,
    toggleStarCampus,
  } = useCampusStore();

  // Modals & Selected items state
  const [isCreateCampusOpen, setIsCreateCampusOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [targetCampusForAction, setTargetCampusForAction] = useState<CampusItem | null>(null);

  // 2FA Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean;
    entityType: DeletableEntityType;
    entityId: string;
    entityName: string;
  }>({
    isOpen: false,
    entityType: "campus",
    entityId: "",
    entityName: "",
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget.entityId) return;

    if (deleteTarget.entityType === "campus") {
      const res = await deleteCampusAction(deleteTarget.entityId);
      if (res.error) throw new Error(res.error);
    } else if (deleteTarget.entityType === "team") {
      const res = await deleteTeamAction(deleteTarget.entityId);
      if (res.error) throw new Error(res.error);
    } else {
      const res = await deleteMemberAction(deleteTarget.entityId);
      if (res.error) throw new Error(res.error);
    }

    await fetchData(true);
  };

  // Initial fetch on mount (only runs if not cached in store)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Computed Filtered Data ────────────────────────────────────
  const starredSet = useMemo(() => new Set(starredCampusIds), [starredCampusIds]);

  const processedCampuses = useMemo(() => {
    return campuses.map((c) => ({
      ...c,
      isStarred: starredSet.has(c.id),
    }));
  }, [campuses, starredSet]);

  // Deep Hierarchical Filtering: Filters campuses AND their nested children
  const filteredCampuses = useMemo(() => {
    const q = filters.searchQuery.toLowerCase().trim();

    return processedCampuses
      .filter((campus) => {
        // 1. Starred filter
        if (filters.isStarredOnly && !campus.isStarred) return false;

        // 2. Campus ID filter
        if (filters.campusId !== "ALL" && campus.id !== filters.campusId) return false;

        return true;
      })
      .map((campus) => {
        // Deep filter nested teams
        const matchingTeams = campus.teams.filter((team) => {
          if (filters.role === "CAMPUS_MANAGER" || filters.role === "TEACHER") return false;
          if (filters.isLeaderOnly && !team.leader_id) return false;
          if (filters.role === "TEAM_LEADER" && !team.leader_id) return false;

          if (q) {
            const matchesTeamName = team.name.toLowerCase().includes(q);
            const matchesLeader =
              (team.leader && team.leader.full_name.toLowerCase().includes(q)) ||
              (team.leader?.ign && team.leader.ign.toLowerCase().includes(q));
            const matchesMember = team.members.some(
              (m) =>
                m.full_name.toLowerCase().includes(q) ||
                m.roll_number.toLowerCase().includes(q) ||
                (m.ign && m.ign.toLowerCase().includes(q))
            );
            return matchesTeamName || matchesLeader || matchesMember;
          }

          return true;
        });

        // Deep filter nested teachers
        const matchingTeachers = campus.teachers.filter((teacher) => {
          if (filters.role === "STUDENT" || filters.role === "TEAM_LEADER" || filters.role === "CAMPUS_MANAGER") {
            return false;
          }
          if (filters.isLeaderOnly) return false;

          if (q) {
            return (
              teacher.full_name.toLowerCase().includes(q) ||
              teacher.roll_number.toLowerCase().includes(q) ||
              (teacher.email && teacher.email.toLowerCase().includes(q))
            );
          }

          return true;
        });

        // Deep filter nested students
        const matchingStudents = campus.students.filter((student) => {
          if (filters.role === "CAMPUS_MANAGER" || filters.role === "TEACHER") return false;
          if (filters.isLeaderOnly && !student.is_team_leader) return false;
          if (filters.role === "TEAM_LEADER" && !student.is_team_leader) return false;
          if (filters.unassignedOnly && student.team_id !== null) return false;

          if (q) {
            return (
              student.full_name.toLowerCase().includes(q) ||
              student.roll_number.toLowerCase().includes(q) ||
              (student.ign && student.ign.toLowerCase().includes(q)) ||
              (student.team_name && student.team_name.toLowerCase().includes(q))
            );
          }

          return true;
        });

        // Manager check
        const managerMatches =
          campus.manager &&
          (filters.role === "ALL" || filters.role === "CAMPUS_MANAGER") &&
          !filters.isLeaderOnly &&
          !filters.unassignedOnly &&
          (!q ||
            campus.manager.full_name.toLowerCase().includes(q) ||
            (campus.manager.email && campus.manager.email.toLowerCase().includes(q)));

        // Campus name/region direct match
        const campusDirectMatch =
          !filters.isLeaderOnly &&
          !filters.unassignedOnly &&
          filters.role === "ALL" &&
          (!q ||
            campus.name.toLowerCase().includes(q) ||
            campus.region.toLowerCase().includes(q));

        const hasMatches =
          campusDirectMatch ||
          managerMatches ||
          matchingTeams.length > 0 ||
          matchingTeachers.length > 0 ||
          matchingStudents.length > 0;

        return {
          ...campus,
          teams: matchingTeams,
          teachers: matchingTeachers,
          students: matchingStudents,
          manager: managerMatches ? campus.manager : (filters.role === "ALL" && !filters.isLeaderOnly ? campus.manager : null),
          _matches: hasMatches,
        };
      })
      .filter((campus) => campus._matches);
  }, [processedCampuses, filters]);

  // Filtered Members for Flat Global Directory View
  const filteredMembers = useMemo(() => {
    const q = filters.searchQuery.toLowerCase().trim();

    return allMembers.filter((m) => {
      if (filters.campusId !== "ALL" && m.campus_id !== filters.campusId) return false;

      if (filters.role !== "ALL") {
        if (filters.role === "TEAM_LEADER") {
          if (!m.is_team_leader) return false;
        } else if (m.role !== filters.role) {
          return false;
        }
      }

      if (filters.isLeaderOnly && !m.is_team_leader) return false;
      if (filters.unassignedOnly && m.team_id !== null) return false;

      if (q) {
        const matches =
          m.full_name.toLowerCase().includes(q) ||
          m.roll_number.toLowerCase().includes(q) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.ign && m.ign.toLowerCase().includes(q)) ||
          (m.campus_name && m.campus_name.toLowerCase().includes(q)) ||
          (m.team_name && m.team_name.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [allMembers, filters]);

  // Filtered Teams for Directory Teams View
  const filteredTeams = useMemo(() => {
    const q = filters.searchQuery.toLowerCase().trim();

    return allTeams.filter((t) => {
      if (filters.campusId !== "ALL" && t.campus_id !== filters.campusId) return false;
      if (filters.role === "CAMPUS_MANAGER" || filters.role === "TEACHER") return false;
      if (filters.isLeaderOnly && !t.leader_id) return false;

      if (q) {
        const matches =
          t.name.toLowerCase().includes(q) ||
          t.campus_name.toLowerCase().includes(q) ||
          (t.leader && t.leader.full_name.toLowerCase().includes(q)) ||
          (t.leader?.ign && t.leader.ign.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [allTeams, filters]);

  // Dynamic live matching entries count based on active view mode
  const totalResultsCount =
    viewMode === "hierarchy" ? filteredCampuses.length : filteredMembers.length;

  // Stats calculation
  const totalCaptainsCount = allMembers.filter((m) => m.is_team_leader).length;
  const totalTeachersCount = allMembers.filter((m) => m.role === "TEACHER").length;
  const totalStudentsCount = allMembers.filter((m) => m.role === "STUDENT").length;

  const handleSelectPreset = (preset: SavedFilterPreset) => {
    setActivePresetId(preset.id);
    setFilters({
      searchQuery: preset.filters.searchQuery ?? "",
      role: preset.filters.role ?? "ALL",
      campusId: preset.filters.campusId ?? "ALL",
      status: preset.filters.status ?? "ALL",
      isLeaderOnly: Boolean(preset.filters.isLeaderOnly),
      unassignedOnly: Boolean(preset.filters.unassignedOnly),
      isStarredOnly: Boolean(preset.filters.isStarredOnly),
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-16">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-pgc-red/15 border border-pgc-red/30 text-[10px] font-extrabold uppercase tracking-widest text-pgc-red font-display">
              INSTITUTIONAL ECOSYSTEM
            </span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-black text-white tracking-tight">
            Campuses &amp; Tournament Rosters
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-sans mt-1 max-w-2xl leading-relaxed">
            Manage regional Punjab Group of Colleges campuses, competitive esports teams, player captains, faculty coaches &amp; global member directories.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setTargetCampusForAction(null);
              setIsAddStudentOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pgc-red text-white text-xs font-bold hover:bg-pgc-hover active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(227,59,41,0.25)] cursor-pointer font-sans"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>

          <button
            onClick={() => {
              setTargetCampusForAction(null);
              setIsCreateTeamOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold active:scale-[0.98] transition-all cursor-pointer font-sans"
          >
            <Flame className="w-4 h-4 text-pgc-red" />
            <span>Create Squad</span>
          </button>

          <button
            onClick={() => {
              setTargetCampusForAction(null);
              setIsCreateCampusOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold active:scale-[0.98] transition-all cursor-pointer font-sans"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Create Campus</span>
          </button>

          <button
            onClick={() => {
              setTargetCampusForAction(null);
              setIsAddMemberOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white text-xs font-bold active:scale-[0.98] transition-all cursor-pointer font-sans"
          >
            <UserPlus className="w-4 h-4 text-purple-400" />
            <span>Add Faculty / Staff</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats Overview (Streamlined & Balanced) ──────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Total Campuses</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-white mt-0.5 tracking-tight">{campuses.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-red/15 text-pgc-red flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Esports Teams</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-pgc-gold mt-0.5 tracking-tight">{allTeams.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-gold/15 text-pgc-gold flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Team Captains</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-amber-400 mt-0.5 tracking-tight">{totalCaptainsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Students &amp; Faculty</p>
            <p className="font-display text-2xl lg:text-3xl font-black text-cyan-400 mt-0.5 tracking-tight">{totalStudentsCount + totalTeachersCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Saved Lists Bar (Spotify-Style Carousel with No Roles) ── */}
      <SavedListsBar
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        currentFilterState={filters}
      />

      {/* ── Filter Bar with Debounced Search & Dynamic Counts ──── */}
      <CampusFilterBar
        filters={filters}
        onFilterChange={(updates) => setFilters(updates)}
        onResetFilters={resetFilters}
        campuses={campuses}
        totalResultsCount={totalResultsCount}
        viewMode={viewMode}
      />

      {/* ── View Toggle Bar (Hierarchical vs Flat Directory) ──────── */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-2xl">
          <button
            onClick={() => setViewMode("hierarchy")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "hierarchy"
                ? "bg-white/15 text-white shadow-sm border border-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-pgc-red" />
            <span className="font-display tracking-tight font-bold">Grouped by Campus (Hierarchical View)</span>
          </button>

          <button
            onClick={() => setViewMode("directory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "directory"
                ? "bg-white/15 text-white shadow-sm border border-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-display tracking-tight font-bold">Global Directory (Everyone Separately)</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden md:block font-sans">
          {viewMode === "hierarchy"
            ? "Showing campuses with deep filtered squad rosters and captains"
            : "Showing categorized dedicated tables with pagination and sorting"}
        </div>
      </div>

      {/* ── Main View Content ───────────────────────────────────── */}
      {!isLoaded && isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-pgc-red border-t-transparent animate-spin" />
          <p className="font-display text-sm font-bold text-white/80 tracking-wide">Loading campuses, teams, and captains from Supabase...</p>
        </div>
      ) : viewMode === "hierarchy" ? (
        <CampusHierarchyView
          campuses={filteredCampuses}
          onSelectCampus={(campus) => router.push(`/admin/campuses/${campus.id}`)}
          onCreateTeamForCampus={(campus) => {
            setTargetCampusForAction(campus);
            setIsCreateTeamOpen(true);
          }}
          onAddStudentForCampus={(campus) => {
            setTargetCampusForAction(campus);
            setIsAddStudentOpen(true);
          }}
          onAddMemberForCampus={(campus) => {
            setTargetCampusForAction(campus);
            setIsAddMemberOpen(true);
          }}
          onToggleStarCampus={toggleStarCampus}
          onDeleteCampus={(campus) =>
            setDeleteTarget({
              isOpen: true,
              entityType: "campus",
              entityId: campus.id,
              entityName: campus.name,
            })
          }
          onDeleteTeam={(team) =>
            setDeleteTarget({
              isOpen: true,
              entityType: "team",
              entityId: team.id,
              entityName: team.name,
            })
          }
          onDeleteMember={(member, type) =>
            setDeleteTarget({
              isOpen: true,
              entityType: type as DeletableEntityType,
              entityId: member.id,
              entityName: member.full_name,
            })
          }
        />
      ) : (
        <GlobalDirectoryView
          members={filteredMembers}
          teams={filteredTeams}
          onSelectMember={(m) => router.push(`/admin/users/${m.id}`)}
          onSelectTeam={(t) => router.push(`/admin/teams/${t.id}`)}
          onDeleteMember={(member, type) =>
            setDeleteTarget({
              isOpen: true,
              entityType: type as DeletableEntityType,
              entityId: member.id,
              entityName: member.full_name,
            })
          }
          onDeleteTeam={(team) =>
            setDeleteTarget({
              isOpen: true,
              entityType: "team",
              entityId: team.id,
              entityName: team.name,
            })
          }
        />
      )}

      {/* ── Creation Modals ─────────────────────────────────────── */}
      <CreateCampusModal
        isOpen={isCreateCampusOpen}
        onOpenChange={setIsCreateCampusOpen}
        onSuccess={() => fetchData(true)}
      />

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onOpenChange={setIsCreateTeamOpen}
        campuses={campuses}
        allStudents={allMembers.filter((m) => m.role === "STUDENT")}
        defaultCampusId={targetCampusForAction?.id || null}
        onSuccess={() => fetchData(true)}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onOpenChange={setIsAddStudentOpen}
        campuses={campuses}
        teams={allTeams}
        defaultCampusId={targetCampusForAction?.id || null}
        onSuccess={() => fetchData(true)}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        campuses={campuses}
        teams={allTeams}
        defaultCampusId={targetCampusForAction?.id || null}
        onSuccess={() => fetchData(true)}
      />

      {/* ── 2FA Secure Delete Confirmation Modal ─────────────────── */}
      <DeleteConfirmationModal
        isOpen={deleteTarget.isOpen}
        onOpenChange={(open) =>
          setDeleteTarget((prev) => ({ ...prev, isOpen: open }))
        }
        entityType={deleteTarget.entityType}
        entityName={deleteTarget.entityName}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
