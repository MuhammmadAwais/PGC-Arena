"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  Filter,
} from "lucide-react";

export interface StudentTableItem {
  id: string;
  full_name: string;
  email: string;
  ign?: string | null;
  roll_number: string;
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
}

type SortField = "name" | "ign" | "roll_number" | "team" | "role";
type SortDirection = "asc" | "desc";

export function DetailStudentTable({
  students,
  title = "Enrolled Students & Players",
  emptyMessage = "No student players currently enrolled.",
  showTeamColumn = true,
}: DetailStudentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "CAPTAINS">("ALL");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
          s.email.toLowerCase().includes(q) ||
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
          // Captains first
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
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-cyan-400 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-cyan-400 font-bold" />
    );
  };

  return (
    <div className="space-y-4">
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
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                roleFilter === "ALL"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter("CAPTAINS")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                roleFilter === "CAPTAINS"
                  ? "bg-pgc-gold/20 text-pgc-gold border border-pgc-gold/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Crown className="w-3 h-3" />
              Captains
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px] sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, IGN, roll #..."
              className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-cyan-400 focus:outline-none text-xs text-white placeholder-slate-500 font-sans transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Sortable Table ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
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
                  Profile
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={showTeamColumn ? 6 : 5} className="p-8 text-center text-slate-400">
                    {searchQuery ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-300">No matching students found</p>
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
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
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
                          <p className="text-[11px] text-slate-400 font-mono">{student.email}</p>
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
                    <td className="p-3.5 px-4 font-mono text-slate-300">{student.roll_number}</td>
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
                      <Link
                        href={`/admin/users/${student.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <span>Manage</span>
                        <ExternalLink className="w-3 h-3" />
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
