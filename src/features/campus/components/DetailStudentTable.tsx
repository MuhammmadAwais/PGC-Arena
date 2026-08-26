"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  ShieldAlert,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DeleteConfirmationModal,
  type DeletableEntityType,
} from "./DeleteConfirmationModal";
import { AddMemberModal } from "./AddMemberModal";
import { AssignStudentModal } from "./AssignStudentModal";
import {
  deleteMemberAction,
  assignStudentToTeamAction,
  assignTeamLeaderAction,
} from "../actions/campusActions";

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
type SortDirection = "asc" | "desc";

export function DetailStudentTable({
  students,
  title = "Enrolled Students & Players",
  emptyMessage = "No student players currently enrolled.",
  showTeamColumn = true,
  campusId,
  teamId,
  allCampuses = [],
  allTeams = [],
  allCandidateStudents = [],
  onRefresh,
}: DetailStudentTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "CAPTAINS">("ALL");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Modals state
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...students];

    // 1. Filter by role
    if (roleFilter === "CAPTAINS") {
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
          const aWeight = a.is_team_leader ? 2 : a.team_name ? 1 : 0;
          const bWeight = b.is_team_leader ? 2 : b.team_name ? 1 : 0;
          comp = bWeight - aWeight;
          break;
      }
      return sortDirection === "asc" ? comp : -comp;
    });

    return result;
  }, [students, searchQuery, roleFilter, sortField, sortDirection]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity" />
      );
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-cyan-400 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-cyan-400 font-bold" />
    );
  };

  // Actions
  const handleAssignCaptain = async (student: StudentTableItem) => {
    if (!student.team_id) return;
    const newLeaderId = student.is_team_leader ? null : student.id;
    await assignTeamLeaderAction(student.team_id, newLeaderId);
    router.refresh();
    onRefresh?.();
  };

  const handleRemoveFromSquad = async (student: StudentTableItem) => {
    await assignStudentToTeamAction(student.id, null);
    router.refresh();
    onRefresh?.();
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget.studentId) return;
    await deleteMemberAction(deleteTarget.studentId);
    router.refresh();
    onRefresh?.();
  };

  return (
    <div className="space-y-4 font-sans">
      {/* ── Table Header & Controls Bar ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h2 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-300">
            {title} ({students.length})
          </h2>
          {searchQuery && (
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
              {filteredAndSorted.length} matching
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Role Filters */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md">
            <button
              onClick={() => setRoleFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                roleFilter === "ALL"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter("CAPTAINS")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                roleFilter === "CAPTAINS"
                  ? "bg-pgc-gold/20 text-pgc-gold border border-pgc-gold/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Crown className="w-3 h-3" />
              <span>Captains</span>
            </button>
          </div>

          {/* Action: Add New Student Modal Trigger */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pgc-red text-white text-xs font-bold hover:bg-pgc-hover active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(227,59,41,0.25)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>

          {/* Action: Draft / Assign Existing Student Modal Trigger */}
          {allCandidateStudents.length > 0 && (
            <button
              onClick={() => setIsDraftModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold active:scale-[0.98] transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Draft Existing</span>
            </button>
          )}

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
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
                    <span>In-Game Name</span>
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
                      <span>Assigned Squad</span>
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
                filteredAndSorted.map((student) => (
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
                            href={`/admin/users/${student.id}`}
                            className="font-bold text-white group-hover:text-cyan-300 transition-colors block"
                          >
                            {student.full_name}
                          </Link>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 px-4">
                      {student.ign ? (
                        <span className="px-2 py-0.5 rounded-full bg-pgc-gold/15 text-pgc-gold border border-pgc-gold/30 font-mono font-bold text-[11px]">
                          #{student.ign}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">—</span>
                      )}
                    </td>
                    <td className="p-3.5 px-4 font-mono text-slate-300">
                      {student.roll_number}
                    </td>
                    {showTeamColumn && (
                      <td className="p-3.5 px-4">
                        {student.team_name ? (
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-pgc-red" />
                            <span>{student.team_name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Free Agent</span>
                        )}
                      </td>
                    )}
                    <td className="p-3.5 px-4">
                      {student.is_team_leader ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pgc-gold/20 text-pgc-gold border border-pgc-gold/40 font-bold text-[10px] uppercase">
                          <Crown className="w-3 h-3" />
                          Captain
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/10 text-[10px] uppercase font-medium">
                          Player
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/users/${student.id}`}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition-all inline-flex items-center gap-1"
                          title="View Profile"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        {/* Quick Row Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer outline-none">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Player Management</DropdownMenuLabel>

                            {student.team_id && (
                              <DropdownMenuItem
                                onClick={() => handleAssignCaptain(student)}
                                className="cursor-pointer gap-2 text-pgc-gold focus:text-pgc-gold"
                              >
                                <Crown className="w-3.5 h-3.5" />
                                <span>
                                  {student.is_team_leader ? "Remove Captain" : "Make Captain"}
                                </span>
                              </DropdownMenuItem>
                            )}

                            {student.team_id && (
                              <DropdownMenuItem
                                onClick={() => handleRemoveFromSquad(student)}
                                className="cursor-pointer gap-2 text-amber-300 focus:text-amber-300"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Remove from Squad</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteTarget({
                                  isOpen: true,
                                  studentId: student.id,
                                  studentName: student.full_name,
                                })
                              }
                              className="cursor-pointer gap-2 text-pgc-red focus:text-pgc-red"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Student</span>
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
      </div>

      {/* ── 1. Create New Student Modal ──────────────────────────── */}
      {isAddModalOpen && (
        <AddMemberModal
          isOpen={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          campuses={allCampuses as any}
          teams={allTeams as any}
          defaultCampusId={campusId}
          onSuccess={() => {
            router.refresh();
            onRefresh?.();
          }}
        />
      )}

      {/* ── 2. Draft / Assign Existing Student Modal ─────────────── */}
      {isDraftModalOpen && (
        <AssignStudentModal
          isOpen={isDraftModalOpen}
          onOpenChange={setIsDraftModalOpen}
          targetType={teamId ? "team" : "campus"}
          targetId={teamId || campusId || ""}
          targetName={teamId ? "Esports Squad" : "Campus Branch"}
          availableStudents={allCandidateStudents}
          onSuccess={() => {
            router.refresh();
            onRefresh?.();
          }}
        />
      )}

      {/* ── 3. 2FA Delete Confirmation Modal ────────────────────── */}
      <DeleteConfirmationModal
        isOpen={deleteTarget.isOpen}
        onOpenChange={(open) =>
          setDeleteTarget((prev) => ({ ...prev, isOpen: open }))
        }
        entityType="player"
        entityName={deleteTarget.studentName}
        onConfirm={handleDeleteStudent}
      />
    </div>
  );
}
