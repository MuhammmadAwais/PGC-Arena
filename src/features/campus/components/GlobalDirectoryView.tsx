"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Crown,
  Users,
  Building2,
  Shield,
  GraduationCap,
  Trophy,
  MoreHorizontal,
  Mail,
  Flame,
  SearchX,
  ExternalLink,
  User,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MemberItem, TeamItem } from "../types/campusTypes";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { useCampusStore } from "../store/useCampusStore";

interface GlobalDirectoryViewProps {
  members: MemberItem[];
  teams: TeamItem[];
  onSelectMember?: (member: MemberItem) => void;
  onSelectTeam?: (team: TeamItem) => void;
  onDeleteMember?: (member: MemberItem, type: string) => void;
  onDeleteTeam?: (team: TeamItem) => void;
}

export function GlobalDirectoryView({
  members,
  teams,
  onSelectMember,
  onSelectTeam,
  onDeleteMember,
  onDeleteTeam,
}: GlobalDirectoryViewProps) {
  const router = useRouter();
  const {
    activeDirectoryTab,
    setActiveDirectoryTab,
    filters,
    resetFilters,
    pagination,
    sorting,
    setTablePage,
    setTablePageSize,
    setTableSorting,
  } = useCampusStore();

  // Helper to slice paginated & sorted list
  const getProcessedItems = <T extends Record<string, any>>(
    tableId: string,
    items: T[],
    defaultPageSize = 5
  ) => {
    const tableSort = sorting[tableId];
    const tablePag = pagination[tableId] || { pageIndex: 0, pageSize: defaultPageSize };

    let sorted = [...items];
    if (tableSort) {
      const { column, direction } = tableSort;
      sorted.sort((a, b) => {
        const valA = a[column] ?? "";
        const valB = b[column] ?? "";
        if (typeof valA === "number" && typeof valB === "number") {
          return direction === "asc" ? valA - valB : valB - valA;
        }
        return direction === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    const start = tablePag.pageIndex * tablePag.pageSize;
    const paginated = sorted.slice(start, start + tablePag.pageSize);

    return {
      items: paginated,
      total: items.length,
      pageIndex: tablePag.pageIndex,
      pageSize: tablePag.pageSize,
      sorting: tableSort,
    };
  };

  // Categorized member groups
  const captains = useMemo(() => members.filter((m) => m.is_team_leader), [members]);
  const managers = useMemo(
    () => (filters.isLeaderOnly ? [] : members.filter((m) => m.role === "CAMPUS_MANAGER")),
    [members, filters.isLeaderOnly]
  );
  const teachers = useMemo(
    () => (filters.isLeaderOnly ? [] : members.filter((m) => m.role === "TEACHER")),
    [members, filters.isLeaderOnly]
  );
  const students = useMemo(
    () => members.filter((m) => m.role === "STUDENT"),
    [members]
  );

  // Processed paginated datasets
  const captainsData = getProcessedItems("tbl_captains", captains);
  const managersData = getProcessedItems("tbl_managers", managers);
  const teachersData = getProcessedItems("tbl_teachers", teachers);
  const studentsData = getProcessedItems("tbl_students", students);
  const teamsData = getProcessedItems("tbl_teams", teams);

  // Check which tables should be visible
  const shouldShowCaptains =
    captainsData.total > 0 &&
    (filters.role === "ALL" || filters.role === "TEAM_LEADER" || filters.isLeaderOnly);

  const shouldShowManagers =
    managersData.total > 0 &&
    (filters.role === "ALL" || filters.role === "CAMPUS_MANAGER") &&
    !filters.isLeaderOnly;

  const shouldShowTeachers =
    teachersData.total > 0 &&
    (filters.role === "ALL" || filters.role === "TEACHER") &&
    !filters.isLeaderOnly;

  const shouldShowTeams =
    teamsData.total > 0 &&
    (filters.role === "ALL" || filters.role === "TEAM_LEADER");

  const shouldShowStudents =
    studentsData.total > 0 &&
    (filters.role === "ALL" || filters.role === "STUDENT" || filters.role === "TEAM_LEADER");

  const hasAnyVisibleTable =
    shouldShowCaptains ||
    shouldShowManagers ||
    shouldShowTeachers ||
    shouldShowTeams ||
    shouldShowStudents;

  // ── 1. Captains Table ─────────────────────────────────────────
  const renderCaptainsTable = () => (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pgc-gold/15 flex items-center justify-center text-pgc-gold border border-pgc-gold/30">
            <Crown className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base lg:text-lg text-white flex items-center gap-2 tracking-tight">
              <span>Team Captains &amp; Squad Leaders</span>
              <span className="px-2 py-0.5 rounded-full bg-pgc-gold/20 text-pgc-gold text-xs font-mono font-bold">
                {captains.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans font-normal mt-0.5">Designated player leadership across all campus squads</p>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-black/30 border-b border-white/[0.06]">
          <TableRow className="border-b-0 hover:bg-transparent">
            <DataTableColumnHeader
              label="Captain Name & IGN"
              columnKey="full_name"
              currentSorting={captainsData.sorting}
              onSort={(c) => setTableSorting("tbl_captains", c)}
            />
            <DataTableColumnHeader
              label="Assigned Team"
              columnKey="team_name"
              currentSorting={captainsData.sorting}
              onSort={(c) => setTableSorting("tbl_captains", c)}
            />
            <DataTableColumnHeader
              label="Campus"
              columnKey="campus_name"
              currentSorting={captainsData.sorting}
              onSort={(c) => setTableSorting("tbl_captains", c)}
            />
            <DataTableColumnHeader
              label="Roll Number"
              columnKey="roll_number"
              currentSorting={captainsData.sorting}
              onSort={(c) => setTableSorting("tbl_captains", c)}
            />
            <DataTableColumnHeader
              label="Team ELO"
              columnKey="elo_rating"
              currentSorting={captainsData.sorting}
              onSort={(c) => setTableSorting("tbl_captains", c)}
            />
            <DataTableColumnHeader label="Actions" columnKey="actions" align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {captainsData.items.map((captain) => (
            <TableRow
              key={captain.id}
              onClick={() => onSelectMember?.(captain)}
              className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              {/* Captain Avatar + Name */}
              <TableCell className="py-3.5">
                <div className="flex items-center gap-3">
                  {captain.avatar_url ? (
                    <img
                      src={captain.avatar_url}
                      alt={captain.full_name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-pgc-gold/80 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-pgc-gold/20 text-pgc-gold border border-pgc-gold/40 flex items-center justify-center font-bold text-xs shrink-0">
                      <Crown className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-sm text-white">
                        {captain.full_name}
                      </span>
                      {captain.ign && (
                        <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-xs font-mono text-pgc-gold font-bold">
                          #{captain.ign}
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 rounded bg-pgc-gold/20 text-pgc-gold text-[10px] font-extrabold uppercase font-display">
                        Captain
                      </span>
                    </div>
                    {captain.email && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-sans">
                        <Mail className="w-3 h-3 text-white/30" />
                        <span>{captain.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Team Logo + Name */}
              <TableCell className="text-xs font-semibold text-slate-200 font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {captain.team_logo_url ? (
                      <img src={captain.team_logo_url} alt={captain.team_name || "Team"} className="w-full h-full object-cover" />
                    ) : (
                      <Flame className="w-3.5 h-3.5 text-pgc-red" />
                    )}
                  </div>
                  <span>{captain.team_name || "Unassigned"}</span>
                </div>
              </TableCell>

              {/* Campus Logo + Name */}
              <TableCell className="text-xs text-slate-300 font-sans font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {captain.campus_logo_url ? (
                      <img src={captain.campus_logo_url} alt={captain.campus_name || "Campus"} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-white/40" />
                    )}
                  </div>
                  <span>{captain.campus_name}</span>
                </div>
              </TableCell>

              <TableCell className="text-xs font-mono text-slate-300 font-bold">
                {captain.roll_number}
              </TableCell>

              <TableCell>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-pgc-gold/10 border border-pgc-gold/30 text-pgc-gold font-display font-black text-xs">
                  <Trophy className="w-3 h-3" />
                  {captain.elo_rating} PTS
                </span>
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/users/${captain.id}`)}
                      className="gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-pgc-gold" />
                      <span>Manage Captain</span>
                    </DropdownMenuItem>
                    {captain.team_id && (
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/teams/${captain.team_id}`)}
                        className="gap-2 cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5 text-pgc-red" />
                        <span>Manage Squad</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDeleteMember?.(captain, "captain")}
                      className="gap-2 text-pgc-red hover:bg-pgc-red/10 focus:bg-pgc-red/10 focus:text-pgc-red cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-pgc-red" />
                      <span>Delete Captain</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DataTablePagination
        totalItems={captainsData.total}
        pageIndex={captainsData.pageIndex}
        pageSize={captainsData.pageSize}
        onPageChange={(p) => setTablePage("tbl_captains", p)}
        onPageSizeChange={(s) => setTablePageSize("tbl_captains", s)}
      />
    </div>
  );

  // 2. Managers Table ────────────────────────────────────────────
  const renderManagersTable = () => (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base lg:text-lg text-white flex items-center gap-2 tracking-tight">
              <span>Campus Managers &amp; Regional Directors</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
                {managers.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans font-normal mt-0.5">Administrative campus leadership and regional oversight</p>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-black/30 border-b border-white/[0.06]">
          <TableRow className="border-b-0 hover:bg-transparent">
            <DataTableColumnHeader
              label="Manager Name"
              columnKey="full_name"
              currentSorting={managersData.sorting}
              onSort={(c) => setTableSorting("tbl_managers", c)}
            />
            <DataTableColumnHeader
              label="Assigned Campus"
              columnKey="campus_name"
              currentSorting={managersData.sorting}
              onSort={(c) => setTableSorting("tbl_managers", c)}
            />
            <DataTableColumnHeader
              label="Employee ID"
              columnKey="roll_number"
              currentSorting={managersData.sorting}
              onSort={(c) => setTableSorting("tbl_managers", c)}
            />
            <DataTableColumnHeader
              label="Email Contact"
              columnKey="email"
              currentSorting={managersData.sorting}
              onSort={(c) => setTableSorting("tbl_managers", c)}
            />
            <DataTableColumnHeader label="Actions" columnKey="actions" align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {managersData.items.map((mgr) => (
            <TableRow
              key={mgr.id}
              onClick={() => onSelectMember?.(mgr)}
              className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              {/* Manager Avatar + Name */}
              <TableCell className="py-3.5">
                <div className="flex items-center gap-3">
                  {mgr.avatar_url ? (
                    <img
                      src={mgr.avatar_url}
                      alt={mgr.full_name}
                      className="w-9 h-9 rounded-full object-cover border border-cyan-400/40 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 font-display">
                      MGR
                    </div>
                  )}
                  <div>
                    <span className="font-sans font-bold text-sm text-white">
                      {mgr.full_name}
                    </span>
                    <p className="text-[11px] text-cyan-400 font-semibold">Head of Campus</p>
                  </div>
                </div>
              </TableCell>

              {/* Campus Logo + Name */}
              <TableCell className="text-xs text-slate-200 font-semibold font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {mgr.campus_logo_url ? (
                      <img src={mgr.campus_logo_url} alt={mgr.campus_name || "Campus"} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-cyan-400/60" />
                    )}
                  </div>
                  <span>{mgr.campus_name}</span>
                </div>
              </TableCell>

              <TableCell className="text-xs font-mono text-slate-300 font-bold">
                {mgr.roll_number}
              </TableCell>
              <TableCell className="text-xs text-slate-300 font-sans">
                {mgr.email}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/users/${mgr.id}`)}
                      className="gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Manage Manager</span>
                    </DropdownMenuItem>
                    {mgr.campus_id && (
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/campuses/${mgr.campus_id}`)}
                        className="gap-2 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-300" />
                        <span>Manage Campus</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDeleteMember?.(mgr, "manager")}
                      className="gap-2 text-pgc-red hover:bg-pgc-red/10 focus:bg-pgc-red/10 focus:text-pgc-red cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-pgc-red" />
                      <span>Delete Manager</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DataTablePagination
        totalItems={managersData.total}
        pageIndex={managersData.pageIndex}
        pageSize={managersData.pageSize}
        onPageChange={(p) => setTablePage("tbl_managers", p)}
        onPageSizeChange={(s) => setTablePageSize("tbl_managers", s)}
      />
    </div>
  );

  // 3. Teachers Table ────────────────────────────────────────────
  const renderTeachersTable = () => (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 border border-purple-500/30">
            <GraduationCap className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base lg:text-lg text-white flex items-center gap-2 tracking-tight">
              <span>Faculty, Teachers &amp; Squad Coaches</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                {teachers.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans font-normal mt-0.5">Academic match hosts and subject tournament supervisors</p>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-black/30 border-b border-white/[0.06]">
          <TableRow className="border-b-0 hover:bg-transparent">
            <DataTableColumnHeader
              label="Teacher Name"
              columnKey="full_name"
              currentSorting={teachersData.sorting}
              onSort={(c) => setTableSorting("tbl_teachers", c)}
            />
            <DataTableColumnHeader
              label="Campus"
              columnKey="campus_name"
              currentSorting={teachersData.sorting}
              onSort={(c) => setTableSorting("tbl_teachers", c)}
            />
            <DataTableColumnHeader
              label="Employee ID"
              columnKey="roll_number"
              currentSorting={teachersData.sorting}
              onSort={(c) => setTableSorting("tbl_teachers", c)}
            />
            <DataTableColumnHeader
              label="Email Address"
              columnKey="email"
              currentSorting={teachersData.sorting}
              onSort={(c) => setTableSorting("tbl_teachers", c)}
            />
            <DataTableColumnHeader label="Actions" columnKey="actions" align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachersData.items.map((tch) => (
            <TableRow
              key={tch.id}
              onClick={() => onSelectMember?.(tch)}
              className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              {/* Teacher Avatar + Name */}
              <TableCell className="py-3.5">
                <div className="flex items-center gap-3">
                  {tch.avatar_url ? (
                    <img
                      src={tch.avatar_url}
                      alt={tch.full_name}
                      className="w-9 h-9 rounded-full object-cover border border-purple-400/40 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 font-display">
                      TCH
                    </div>
                  )}
                  <div>
                    <span className="font-sans font-bold text-sm text-white">
                      {tch.full_name}
                    </span>
                    <p className="text-[11px] text-purple-300 font-semibold">Faculty / Coach</p>
                  </div>
                </div>
              </TableCell>

              {/* Campus Logo + Name */}
              <TableCell className="text-xs text-slate-200 font-semibold font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {tch.campus_logo_url ? (
                      <img src={tch.campus_logo_url} alt={tch.campus_name || "Campus"} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-purple-400/60" />
                    )}
                  </div>
                  <span>{tch.campus_name}</span>
                </div>
              </TableCell>

              <TableCell className="text-xs font-mono text-slate-300 font-bold">
                {tch.roll_number}
              </TableCell>
              <TableCell className="text-xs text-slate-300 font-sans">
                {tch.email}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/users/${tch.id}`)}
                      className="gap-2 cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                      <span>Manage Faculty</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteMember?.(tch, "teacher")}
                      className="gap-2 text-pgc-red hover:bg-pgc-red/10 focus:bg-pgc-red/10 focus:text-pgc-red cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-pgc-red" />
                      <span>Delete Faculty</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DataTablePagination
        totalItems={teachersData.total}
        pageIndex={teachersData.pageIndex}
        pageSize={teachersData.pageSize}
        onPageChange={(p) => setTablePage("tbl_teachers", p)}
        onPageSizeChange={(s) => setTablePageSize("tbl_teachers", s)}
      />
    </div>
  );

  // 4. Teams Table ───────────────────────────────────────────────
  const renderTeamsTable = () => (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pgc-red/15 flex items-center justify-center text-pgc-red border border-pgc-red/30">
            <Flame className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base lg:text-lg text-white flex items-center gap-2 tracking-tight">
              <span>Competitive Esports Teams</span>
              <span className="px-2 py-0.5 rounded-full bg-pgc-red/20 text-pgc-red text-xs font-mono font-bold">
                {teams.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans font-normal mt-0.5">Tournament squads, active ELO ratings, and member rosters</p>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-black/30 border-b border-white/[0.06]">
          <TableRow className="border-b-0 hover:bg-transparent">
            <DataTableColumnHeader
              label="Team Name"
              columnKey="name"
              currentSorting={teamsData.sorting}
              onSort={(c) => setTableSorting("tbl_teams", c)}
            />
            <DataTableColumnHeader
              label="Campus"
              columnKey="campus_name"
              currentSorting={teamsData.sorting}
              onSort={(c) => setTableSorting("tbl_teams", c)}
            />
            <DataTableColumnHeader
              label="Team Captain"
              columnKey="leader_id"
              currentSorting={teamsData.sorting}
              onSort={(c) => setTableSorting("tbl_teams", c)}
            />
            <DataTableColumnHeader
              label="Squad Size"
              columnKey="member_count"
              currentSorting={teamsData.sorting}
              onSort={(c) => setTableSorting("tbl_teams", c)}
            />
            <DataTableColumnHeader
              label="ELO Points"
              columnKey="elo_rating"
              currentSorting={teamsData.sorting}
              onSort={(c) => setTableSorting("tbl_teams", c)}
            />
            <DataTableColumnHeader label="Actions" columnKey="actions" align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamsData.items.map((team) => (
            <TableRow
              key={team.id}
              onClick={() => onSelectTeam?.(team)}
              className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              {/* Team Logo + Name */}
              <TableCell className="py-3.5 font-bold text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <Flame className="w-4 h-4 text-pgc-red" />
                    )}
                  </div>
                  <span className="font-display font-black text-sm tracking-tight">{team.name}</span>
                </div>
              </TableCell>

              {/* Campus Logo + Name */}
              <TableCell className="text-xs text-slate-200 font-semibold font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {team.campus_logo_url ? (
                      <img src={team.campus_logo_url} alt={team.campus_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-white/40" />
                    )}
                  </div>
                  <span>{team.campus_name}</span>
                </div>
              </TableCell>

              {/* Captain Avatar + Name */}
              <TableCell className="text-xs">
                {team.leader ? (
                  <div className="flex items-center gap-2">
                    {team.leader.avatar_url ? (
                      <img
                        src={team.leader.avatar_url}
                        alt={team.leader.full_name}
                        className="w-6 h-6 rounded-full object-cover border border-pgc-gold/70 shrink-0"
                      />
                    ) : (
                      <Crown className="w-3.5 h-3.5 text-pgc-gold shrink-0" />
                    )}
                    <span className="font-bold text-white font-sans">{team.leader.full_name}</span>
                    {team.leader.ign && (
                      <span className="text-xs text-pgc-gold font-mono font-bold">
                        (#{team.leader.ign})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 italic font-sans">Unassigned</span>
                )}
              </TableCell>

              <TableCell className="text-xs text-slate-200 font-semibold font-sans">
                {team.member_count} Squad Members
              </TableCell>

              <TableCell>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-pgc-gold/10 border border-pgc-gold/30 text-pgc-gold font-display font-black text-xs">
                  <Trophy className="w-3 h-3" />
                  {team.elo_rating} PTS
                </span>
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/teams/${team.id}`)}
                      className="gap-2 cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5 text-pgc-red" />
                      <span>Manage Squad</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteTeam?.(team)}
                      className="gap-2 text-pgc-red hover:bg-pgc-red/10 focus:bg-pgc-red/10 focus:text-pgc-red cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-pgc-red" />
                      <span>Delete Squad</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DataTablePagination
        totalItems={teamsData.total}
        pageIndex={teamsData.pageIndex}
        pageSize={teamsData.pageSize}
        onPageChange={(p) => setTablePage("tbl_teams", p)}
        onPageSizeChange={(s) => setTablePageSize("tbl_teams", s)}
      />
    </div>
  );

  // 5. Students Table ────────────────────────────────────────────
  const renderStudentsTable = () => (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center text-white/90 border border-white/10">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base lg:text-lg text-white flex items-center gap-2 tracking-tight">
              <span>Student Players &amp; Enrolled Roster</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-xs font-mono font-bold">
                {students.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans font-normal mt-0.5">Student competitors across all academic divisions</p>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-black/30 border-b border-white/[0.06]">
          <TableRow className="border-b-0 hover:bg-transparent">
            <DataTableColumnHeader
              label="Student Name & IGN"
              columnKey="full_name"
              currentSorting={studentsData.sorting}
              onSort={(c) => setTableSorting("tbl_students", c)}
            />
            <DataTableColumnHeader
              label="Campus"
              columnKey="campus_name"
              currentSorting={studentsData.sorting}
              onSort={(c) => setTableSorting("tbl_students", c)}
            />
            <DataTableColumnHeader
              label="Assigned Team"
              columnKey="team_name"
              currentSorting={studentsData.sorting}
              onSort={(c) => setTableSorting("tbl_students", c)}
            />
            <DataTableColumnHeader
              label="Roll Number"
              columnKey="roll_number"
              currentSorting={studentsData.sorting}
              onSort={(c) => setTableSorting("tbl_students", c)}
            />
            <DataTableColumnHeader label="Role" columnKey="role" />
            <DataTableColumnHeader label="Actions" columnKey="actions" align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentsData.items.map((stu) => (
            <TableRow
              key={stu.id}
              onClick={() => onSelectMember?.(stu)}
              className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              {/* Student Avatar + Name */}
              <TableCell className="py-3.5">
                <div className="flex items-center gap-3">
                  {stu.avatar_url ? (
                    <img
                      src={stu.avatar_url}
                      alt={stu.full_name}
                      className={`w-9 h-9 rounded-full object-cover shrink-0 ${
                        stu.is_team_leader ? "border-2 border-pgc-gold/80" : "border border-white/10"
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        stu.is_team_leader
                          ? "bg-pgc-gold/20 text-pgc-gold border border-pgc-gold/40"
                          : "bg-white/[0.05] text-white/70"
                      }`}
                    >
                      {stu.is_team_leader ? <Crown className="w-3.5 h-3.5 text-pgc-gold" /> : stu.full_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-sm text-white">
                        {stu.full_name}
                      </span>
                      {stu.ign && (
                        <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-xs font-mono text-pgc-gold font-bold">
                          #{stu.ign}
                        </span>
                      )}
                      {stu.is_team_leader && (
                        <span className="px-1.5 py-0.2 rounded bg-pgc-gold/20 text-pgc-gold text-[10px] font-extrabold uppercase font-display">
                          Captain
                        </span>
                      )}
                    </div>
                    {stu.email && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-sans">
                        <Mail className="w-3 h-3 text-white/30" />
                        <span>{stu.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Campus Logo + Name */}
              <TableCell className="text-xs text-slate-200 font-semibold font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {stu.campus_logo_url ? (
                      <img src={stu.campus_logo_url} alt={stu.campus_name || "Campus"} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-white/30" />
                    )}
                  </div>
                  <span>{stu.campus_name}</span>
                </div>
              </TableCell>

              {/* Team Logo + Name */}
              <TableCell className="text-xs font-sans">
                {stu.team_name ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {stu.team_logo_url ? (
                        <img src={stu.team_logo_url} alt={stu.team_name} className="w-full h-full object-cover" />
                      ) : (
                        <Flame className="w-3 h-3 text-pgc-red" />
                      )}
                    </div>
                    <span className="text-white font-semibold">{stu.team_name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </TableCell>

              <TableCell className="text-xs font-mono text-slate-300 font-bold">
                {stu.roll_number}
              </TableCell>

              <TableCell>
                {stu.is_team_leader ? (
                  <Badge variant="outline" className="bg-pgc-gold/15 text-pgc-gold border-pgc-gold/30 text-xs font-extrabold">
                    👑 Captain
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-white/10 text-slate-300 border-white/20 text-xs font-medium">
                    Player
                  </Badge>
                )}
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/users/${stu.id}`)}
                      className="gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-300" />
                      <span>Manage Student</span>
                    </DropdownMenuItem>
                    {stu.team_id && (
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/teams/${stu.team_id}`)}
                        className="gap-2 cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5 text-pgc-red" />
                        <span>Manage Squad</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDeleteMember?.(stu, "player")}
                      className="gap-2 text-pgc-red hover:bg-pgc-red/10 focus:bg-pgc-red/10 focus:text-pgc-red cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-pgc-red" />
                      <span>Delete Student</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DataTablePagination
        totalItems={studentsData.total}
        pageIndex={studentsData.pageIndex}
        pageSize={studentsData.pageSize}
        onPageChange={(p) => setTablePage("tbl_students", p)}
        onPageSizeChange={(s) => setTablePageSize("tbl_students", s)}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Sub-Category Tabs ───────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveDirectoryTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
            activeDirectoryTab === "all"
              ? "bg-white/15 text-white border border-white/20 shadow-sm"
              : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Role Tables ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveDirectoryTab("captains")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
            activeDirectoryTab === "captains"
              ? "bg-pgc-gold/20 text-pgc-gold border border-pgc-gold/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-pgc-gold" />
          <span>Captains ({captains.length})</span>
        </button>

        <button
          onClick={() => setActiveDirectoryTab("managers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
            activeDirectoryTab === "managers"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Managers ({managers.length})</span>
        </button>

        <button
          onClick={() => setActiveDirectoryTab("teachers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
            activeDirectoryTab === "teachers"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
              : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Teachers ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveDirectoryTab("students")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
            activeDirectoryTab === "students"
              ? "bg-white/15 text-white border border-white/20"
              : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Students ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveDirectoryTab("teams")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
            activeDirectoryTab === "teams"
              ? "bg-pgc-red/20 text-pgc-red border border-pgc-red/40"
              : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Esports Teams ({teams.length})</span>
        </button>
      </div>

      {/* ── Main Categorized Tables Content ─────────────────────── */}
      {activeDirectoryTab === "all" ? (
        !hasAnyVisibleTable ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3">
            <SearchX className="w-12 h-12 text-white/20" />
            <p className="font-display text-base font-extrabold text-white/70 tracking-wide">
              No matching records found across any role.
            </p>
            <p className="text-xs text-slate-400 font-sans">
              Try adjusting your search criteria or resetting filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-pgc-red text-white text-xs font-bold hover:bg-pgc-hover transition-colors cursor-pointer font-sans"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200">
            {shouldShowCaptains && renderCaptainsTable()}
            {shouldShowManagers && renderManagersTable()}
            {shouldShowTeachers && renderTeachersTable()}
            {shouldShowTeams && renderTeamsTable()}
            {shouldShowStudents && renderStudentsTable()}
          </div>
        )
      ) : activeDirectoryTab === "captains" ? (
        captainsData.total === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3">
            <Crown className="w-12 h-12 text-white/20" />
            <p className="font-display text-base font-extrabold text-white/70 tracking-wide">No team captains match the filter criteria.</p>
          </div>
        ) : (
          renderCaptainsTable()
        )
      ) : activeDirectoryTab === "managers" ? (
        managersData.total === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3">
            <Shield className="w-12 h-12 text-white/20" />
            <p className="font-display text-base font-extrabold text-white/70 tracking-wide">No campus managers match the filter criteria.</p>
          </div>
        ) : (
          renderManagersTable()
        )
      ) : activeDirectoryTab === "teachers" ? (
        teachersData.total === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3">
            <GraduationCap className="w-12 h-12 text-white/20" />
            <p className="font-display text-base font-extrabold text-white/70 tracking-wide">No faculty members match the filter criteria.</p>
          </div>
        ) : (
          renderTeachersTable()
        )
      ) : activeDirectoryTab === "students" ? (
        studentsData.total === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3">
            <Users className="w-12 h-12 text-white/20" />
            <p className="font-display text-base font-extrabold text-white/70 tracking-wide">No student records match the filter criteria.</p>
          </div>
        ) : (
          renderStudentsTable()
        )
      ) : teamsData.total === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3">
          <Flame className="w-12 h-12 text-white/20" />
          <p className="font-display text-base font-extrabold text-white/70 tracking-wide">No esports teams match the filter criteria.</p>
        </div>
      ) : (
        renderTeamsTable()
      )}
    </div>
  );
}
