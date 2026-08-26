"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Crown,
  Flame,
  ExternalLink,
  Users,
  X,
  Plus,
  Trash2,
  UserPlus,
  MoreVertical,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DeletableEntityType } from "./DeleteConfirmationModal";
import {
  deleteMemberAction,
  assignStudentToTeamAction,
  assignTeamLeaderAction,
  getAssignableDataAction,
} from "../actions/campusActions";

// ── Dynamic Lazy-Loaded Modals (Code-Split for performance) ───────
const DynamicAddStudentModal = dynamic(
  () => import("./AddStudentModal").then((mod) => mod.AddStudentModal),
  { ssr: false }
);

const DynamicAssignStudentModal = dynamic(
  () => import("./AssignStudentModal").then((mod) => mod.AssignStudentModal),
  { ssr: false }
);

const DynamicDeleteConfirmationModal = dynamic(
  () => import("./DeleteConfirmationModal").then((mod) => mod.DeleteConfirmationModal),
  { ssr: false }
);

export interface StudentTableItem {
  id: string;
  full_name: string;
  email?: string;
  ign?: string | null;
  roll_number: string;
  campus_id?: string | null;
  campus_name?: string;
  team_id?: string | null;
  team_name?: string;
  is_team_leader?: boolean;
  avatar_url?: string | null;
  academic_program?: string;
  elo_rating?: number;
}

interface DetailStudentTableProps {
  students: StudentTableItem[];
  title?: string;
  emptyMessage?: string;
  showTeamColumn?: boolean;
  campusId?: string;
  teamId?: string;
  allCampuses?: { id: string; name: string; region?: string; logo_url?: string | null }[];
  allTeams?: { id: string; name: string; campus_id: string; logo_url?: string | null }[];
  allCandidateStudents?: StudentTableItem[];
  onRefresh?: () => void;
}

type SortField = "name" | "ign" | "roll_number" | "team" | "role";
type SortOrder = "asc" | "desc";

export function DetailStudentTable({
  students,
  title = "Enrolled Students & Players",
  emptyMessage = "No students found in this roster.",
  showTeamColumn = true,
  campusId,
  teamId,
  allCampuses: initialCampuses,
  allTeams: initialTeams,
  allCandidateStudents: initialCandidates,
  onRefresh,
}: DetailStudentTableProps) {
  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "captains" | "players">("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination State
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modal Triggers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
  }>({
    isOpen: false,
    studentId: "",
    studentName: "",
  });

  // Lazy-loaded assignables cache
  const [lazyAssignables, setLazyAssignables] = useState<{
    campuses: any[];
    users: any[];
    teams: any[];
  } | null>(null);

  const loadAssignables = useCallback(async () => {
    if (lazyAssignables || initialCampuses) return;
    const res = await getAssignableDataAction();
    setLazyAssignables(res);
  }, [lazyAssignables, initialCampuses]);

  const handleOpenAdd = () => {
    loadAssignables();
    setIsAddModalOpen(true);
  };

  const handleOpenDraft = () => {
    loadAssignables();
    setIsDraftModalOpen(true);
  };

  const campusesList = initialCampuses || lazyAssignables?.campuses || [];
  const teamsList = initialTeams || lazyAssignables?.teams || [];
  const candidatesList =
    initialCandidates ||
    (lazyAssignables?.users || [])
      .filter((u) => u.role === "STUDENT")
      .map((u) => {
        const uCampus = campusesList.find((c: any) => c.id === u.campus_id);
        const uTeam = teamsList.find((t: any) => t.id === u.team_id);
        return {
          ...u,
          campus_name: uCampus?.name,
          team_name: uTeam?.name,
        };
      });

  // Row Action State
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter & Sort Logic with Memoization
  const filteredAndSorted = useMemo(() => {
    let result = [...students];

    // 1. Filter by role/captain
    if (roleFilter === "captains") {
      result = result.filter((s) => s.is_team_leader);
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          (s.ign && s.ign.toLowerCase().includes(q)) ||
          s.roll_number.toLowerCase().includes(q) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.team_name && s.team_name.toLowerCase().includes(q))
      );
    }

    // 3. Sort
    result.sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case "name":
          comp = a.full_name.localeCompare(b.full_name);
          break;
        case "ign":
          comp = (a.ign || "").localeCompare(b.ign || "");
          break;
        case "roll_number":
          comp = a.roll_number.localeCompare(b.roll_number);
          break;
        case "team":
          comp = (a.team_name || "").localeCompare(b.team_name || "");
          break;
        case "role":
          comp = (a.is_team_leader ? 1 : 0) - (b.is_team_leader ? 1 : 0);
          break;
        default:
          comp = 0;
      }
      return sortOrder === "asc" ? comp : -comp;
    });

    return result;
  }, [students, roleFilter, searchQuery, sortField, sortOrder]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, pageIndex, pageSize]);

  // Action: Toggle Captain
  const handleToggleCaptain = async (student: StudentTableItem) => {
    if (!student.team_id) return;
    try {
      setActionLoadingId(student.id);
      const newLeaderId = student.is_team_leader ? null : student.id;
      const res = await assignTeamLeaderAction(student.team_id, newLeaderId);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
        onRefresh?.();
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to update captain status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Remove student from team
  const handleRemoveFromTeam = async (student: StudentTableItem) => {
    try {
      setActionLoadingId(student.id);
      const res = await assignStudentToTeamAction(student.id, null);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
        onRefresh?.();
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to remove student from team.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Delete student permanently
  const handleDeleteStudent = async () => {
    if (!deleteTarget.studentId) return;
    const res = await deleteMemberAction(deleteTarget.studentId);
    if (res?.error) {
      throw new Error(res.error);
    }
    router.refresh();
    onRefresh?.();
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-400" />
    );
  };

  const startRecord = filteredAndSorted.length === 0 ? 0 : pageIndex * pageSize + 1;
  const endRecord = Math.min((pageIndex + 1) * pageSize, filteredAndSorted.length);

  return (
    <div className="space-y-4">
      {/* ── Table Header Controls & Action Bar ───────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-300">
              {title}
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-xs font-mono font-bold text-slate-300">
            {filteredAndSorted.length} {filteredAndSorted.length === 1 ? "Player" : "Players"}
          </span>
        </div>

        {/* Global Row Actions */}
        <div className="flex items-center gap-2">
          {/* Action: Add Student */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Student</span>
          </button>

          {/* Action: Draft Existing */}
          <button
            onClick={handleOpenDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pgc-red/90 hover:bg-pgc-red border border-pgc-red/40 text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Draft Existing</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
          <button
            onClick={() => {
              setRoleFilter("all");
              setPageIndex(0);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              roleFilter === "all"
                ? "bg-white/[0.12] text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Players
          </button>
          <button
            onClick={() => {
              setRoleFilter("captains");
              setPageIndex(0);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              roleFilter === "captains"
                ? "bg-pgc-gold/20 text-pgc-gold border border-pgc-gold/40"
                : "text-slate-400 hover:text-pgc-gold"
            }`}
          >
            <Crown className="w-3 h-3" />
            <span>Captains Only</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPageIndex(0);
            }}
            placeholder="Search by Name, IGN, Roll..."
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPageIndex(0);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Sortable Table ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th
                  onClick={() => handleSort("name")}
                  className="p-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-white transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student / Player</span>
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("ign")}
                  className="p-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-white transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>IGN Gamer Tag</span>
                    {renderSortIcon("ign")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("roll_number")}
                  className="p-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-white transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Roll Number</span>
                    {renderSortIcon("roll_number")}
                  </div>
                </th>
                {showTeamColumn && (
                  <th
                    onClick={() => handleSort("team")}
                    className="p-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-white transition-colors group select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Squad Assignment</span>
                      {renderSortIcon("team")}
                    </div>
                  </th>
                )}
                <th
                  onClick={() => handleSort("role")}
                  className="p-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-white transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Roster Role</span>
                    {renderSortIcon("role")}
                  </div>
                </th>
                <th className="p-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right font-display select-none">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={showTeamColumn ? 6 : 5}
                    className="p-8 text-center text-slate-400"
                  >
                    {searchQuery ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-300">
                          No matching students found
                        </p>
                        <p className="text-xs text-slate-500">
                          Try searching for a different name, IGN, or clear filters.
                        </p>
                      </div>
                    ) : (
                      emptyMessage
                    )}
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {student.avatar_url ? (
                          <img
                            src={student.avatar_url}
                            alt={student.full_name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                            {student.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <Link
                            prefetch={true}
                            href={`/admin/users/${student.id}`}
                            className="font-bold text-white group-hover:text-cyan-300 transition-colors block"
                          >
                            {student.full_name}
                          </Link>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {student.email || student.roll_number}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 px-4">
                      {student.ign ? (
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-pgc-gold font-mono font-bold text-xs">
                          #{student.ign}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">—</span>
                      )}
                    </td>
                    <td className="p-3.5 px-4 font-mono text-slate-300 font-medium">
                      {student.roll_number}
                    </td>
                    {showTeamColumn && (
                      <td className="p-3.5 px-4">
                        {student.team_name ? (
                          <Link
                            prefetch={true}
                            href={`/admin/teams/${student.team_id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pgc-red/10 border border-pgc-red/20 text-pgc-red text-xs font-bold hover:bg-pgc-red/20 transition-colors"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>{student.team_name}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-500 text-xs italic">
                            Unassigned (Free Agent)
                          </span>
                        )}
                      </td>
                    )}
                    <td className="p-3.5 px-4">
                      {student.is_team_leader ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pgc-gold/15 border border-pgc-gold/30 text-pgc-gold text-[10px] font-extrabold uppercase tracking-wide">
                          <Crown className="w-3 h-3" />
                          <span>Captain</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">
                          Active Player
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          prefetch={true}
                          href={`/admin/users/${student.id}`}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                          title="View Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Interactive Dropdown Menu for Roster Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={actionLoadingId === student.id}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-[#0E101F]/95 backdrop-blur-xl border border-white/10 text-white rounded-xl shadow-2xl p-1.5 z-50 font-sans"
                          >
                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                              Roster Actions
                            </DropdownMenuLabel>

                            {/* Action: Toggle Captain (Only if in a team) */}
                            {student.team_id && (
                              <DropdownMenuItem
                                onClick={() => handleToggleCaptain(student)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:text-pgc-gold hover:bg-white/[0.06] cursor-pointer"
                              >
                                <Crown className="w-3.5 h-3.5 text-pgc-gold" />
                                <span>
                                  {student.is_team_leader
                                    ? "Remove Captaincy"
                                    : "Make Team Captain"}
                                </span>
                              </DropdownMenuItem>
                            )}

                            {/* Action: Remove from squad (Only if in a team) */}
                            {student.team_id && (
                              <DropdownMenuItem
                                onClick={() => handleRemoveFromTeam(student)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:text-amber-400 hover:bg-white/[0.06] cursor-pointer"
                              >
                                <LogOut className="w-3.5 h-3.5 text-amber-400" />
                                <span>Remove from Squad</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-white/[0.08] my-1" />

                            {/* Action: Delete Student Permanently */}
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteTarget({
                                  isOpen: true,
                                  studentId: student.id,
                                  studentName: student.full_name,
                                })
                              }
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              <span>Delete Student...</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Pagination Bar ───────────────────────────────── */}
        {filteredAndSorted.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 px-4 border-t border-white/[0.06] text-xs font-sans text-slate-400 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <span>
                Showing <span className="text-white font-bold">{startRecord}</span> to{" "}
                <span className="text-white font-bold">{endRecord}</span> of{" "}
                <span className="text-white font-bold">{filteredAndSorted.length}</span> students
              </span>

              <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
                <span>Per page:</span>
                {[10, 25, 50].map((size) => (
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

      {/* ── 1. Dynamic Add Student Modal ──────────────────────────── */}
      {isAddModalOpen && (
        <DynamicAddStudentModal
          isOpen={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          campuses={campusesList as any}
          teams={teamsList as any}
          defaultCampusId={campusId}
          defaultTeamId={teamId}
          onSuccess={() => {
            router.refresh();
            onRefresh?.();
          }}
        />
      )}

      {/* ── 2. Dynamic Draft / Assign Existing Student Modal ─────── */}
      {isDraftModalOpen && (
        <DynamicAssignStudentModal
          isOpen={isDraftModalOpen}
          onOpenChange={setIsDraftModalOpen}
          targetType={teamId ? "team" : "campus"}
          targetId={teamId || campusId || ""}
          targetName={teamId ? "Esports Squad" : "Campus Branch"}
          availableStudents={candidatesList}
          onSuccess={() => {
            router.refresh();
            onRefresh?.();
          }}
        />
      )}

      {/* ── 3. Dynamic 2FA Delete Confirmation Modal ─────────────── */}
      {deleteTarget.isOpen && (
        <DynamicDeleteConfirmationModal
          isOpen={deleteTarget.isOpen}
          onOpenChange={(open) =>
            setDeleteTarget((prev) => ({ ...prev, isOpen: open }))
          }
          entityType="player"
          entityName={deleteTarget.studentName}
          onConfirm={handleDeleteStudent}
        />
      )}
    </div>
  );
}
