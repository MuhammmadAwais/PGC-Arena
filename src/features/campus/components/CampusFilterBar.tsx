"use client";

import { useState, useEffect } from "react";
import {
  Search,
  X,
  Building2,
  Users,
  Sparkles,
  Crown,
  Shield,
  GraduationCap,
  ChevronDown,
  Check,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CampusItem } from "../types/campusTypes";
import { useDebounce } from "../hooks/useDebounce";

interface FilterState {
  searchQuery: string;
  role: string;
  campusId: string;
  status: string;
  isLeaderOnly: boolean;
  unassignedOnly: boolean;
  isStarredOnly: boolean;
}

interface CampusFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  campuses: CampusItem[];
  totalResultsCount: number;
  viewMode?: "hierarchy" | "directory";
}

const ROLE_OPTIONS = [
  { value: "ALL", label: "All Roles", icon: Users, color: "text-slate-300" },
  { value: "CAMPUS_MANAGER", label: "Campus Managers", icon: Shield, color: "text-cyan-400" },
  { value: "TEACHER", label: "Teachers & Faculty", icon: GraduationCap, color: "text-purple-300" },
  { value: "TEAM_LEADER", label: "Team Captains / Leaders", icon: Crown, color: "text-pgc-gold" },
  { value: "STUDENT", label: "Students / Players", icon: Users, color: "text-emerald-400" },
];

export function CampusFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  campuses,
  totalResultsCount,
  viewMode = "hierarchy",
}: CampusFilterBarProps) {
  // Local search state for instantaneous typing + debounced propagation
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const debouncedSearch = useDebounce(localSearch, 250);

  // When debounced value changes, notify parent/store
  useEffect(() => {
    if (debouncedSearch !== filters.searchQuery) {
      onFilterChange({ searchQuery: debouncedSearch });
    }
  }, [debouncedSearch]);

  // Keep local search in sync if filters are reset from outside
  useEffect(() => {
    setLocalSearch(filters.searchQuery);
  }, [filters.searchQuery]);

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.role !== "ALL" ||
    filters.campusId !== "ALL" ||
    filters.status !== "ALL" ||
    filters.isLeaderOnly ||
    filters.unassignedOnly ||
    filters.isStarredOnly
  );

  // Dynamic entity label based on active view mode and pluralization
  const getDynamicCountLabel = () => {
    if (viewMode === "hierarchy") {
      return totalResultsCount === 1 ? "1 campus" : `${totalResultsCount} campuses`;
    }
    return totalResultsCount === 1 ? "1 member" : `${totalResultsCount} members`;
  };

  // Selected campus & role objects
  const selectedCampus = campuses.find((c) => c.id === filters.campusId);
  const selectedRole = ROLE_OPTIONS.find((r) => r.value === filters.role) || ROLE_OPTIONS[0];
  const SelectedRoleIcon = selectedRole.icon;

  return (
    <div className="flex flex-col gap-3.5 bg-white/[0.02] border border-white/[0.08] p-4.5 rounded-2xl backdrop-blur-md">
      {/* ── Top Row: Search & Primary Dropdowns ────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar with Debounce */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search by name, roll no, IGN, campus, or team..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-10 bg-black/30 border-white/10 text-white placeholder-white/30 h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-pgc-red text-sm font-sans"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                onFilterChange({ searchQuery: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters (Custom Frosted Glass) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Custom Campus Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-10 px-3.5 rounded-xl bg-black/30 hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-2 cursor-pointer outline-none focus:border-pgc-red/60">
              <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 overflow-hidden">
                {selectedCampus?.logo_url ? (
                  <img src={selectedCampus.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-white/40" />
                )}
              </div>
              <span className="max-w-[140px] sm:max-w-[180px] truncate">
                {selectedCampus ? selectedCampus.name : "All Campuses"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 ml-0.5 shrink-0" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 max-h-72 overflow-y-auto">
              <DropdownMenuLabel>Select Campus</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onFilterChange({ campusId: "ALL" })}
                className="justify-between"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-white/40" />
                  <span>All Campuses</span>
                </div>
                {filters.campusId === "ALL" && <Check className="w-3.5 h-3.5 text-pgc-red" />}
              </DropdownMenuItem>

              {campuses.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => onFilterChange({ campusId: c.id })}
                  className="justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {c.logo_url ? (
                        <img src={c.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-3 h-3 text-white/60" />
                      )}
                    </div>
                    <span className="truncate">{c.name}</span>
                  </div>
                  {filters.campusId === c.id && <Check className="w-3.5 h-3.5 text-pgc-red shrink-0" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Custom Role Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-10 px-3.5 rounded-xl bg-black/30 hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-2 cursor-pointer outline-none focus:border-pgc-red/60">
              <SelectedRoleIcon className={`w-3.5 h-3.5 ${selectedRole.color}`} />
              <span className="max-w-[130px] sm:max-w-[160px] truncate">
                {selectedRole.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 ml-0.5 shrink-0" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter By Role</DropdownMenuLabel>
              {ROLE_OPTIONS.map((r) => {
                const Icon = r.icon;
                const isSelected = filters.role === r.value;
                return (
                  <DropdownMenuItem
                    key={r.value}
                    onClick={() => onFilterChange({ role: r.value })}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${r.color}`} />
                      <span>{r.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-pgc-red" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Quick Starred Campuses Filter Toggle */}
          <button
            onClick={() => onFilterChange({ isStarredOnly: !filters.isStarredOnly })}
            className={`flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filters.isStarredOnly
                ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold"
                : "bg-black/30 border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.04]"
            }`}
            title="Filter by starred campuses"
          >
            <Star className={`w-3.5 h-3.5 ${filters.isStarredOnly ? "fill-amber-400 text-amber-400" : ""}`} />
            <span>Starred</span>
          </button>

          {/* 4. Quick Captain Filter Toggle */}
          <button
            onClick={() => onFilterChange({ isLeaderOnly: !filters.isLeaderOnly })}
            className={`flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filters.isLeaderOnly
                ? "bg-pgc-gold/15 border-pgc-gold text-pgc-gold shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "bg-black/30 border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Captains Only</span>
          </button>
        </div>
      </div>

      {/* ── Active Filter Badges with Quick 1-Click Dismiss ─────── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Active:
          </span>

          {filters.isStarredOnly && (
            <button
              onClick={() => onFilterChange({ isStarredOnly: false })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Starred Campuses</span>
              <X className="w-3 h-3 ml-0.5 opacity-70 hover:opacity-100" />
            </button>
          )}

          {filters.isLeaderOnly && (
            <button
              onClick={() => onFilterChange({ isLeaderOnly: false })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pgc-gold/20 border border-pgc-gold/40 text-pgc-gold text-xs font-semibold hover:bg-pgc-gold/30 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-pgc-gold" />
              <span>Captains Only</span>
              <X className="w-3 h-3 ml-0.5 opacity-70 hover:opacity-100" />
            </button>
          )}

          {filters.campusId !== "ALL" && selectedCampus && (
            <button
              onClick={() => onFilterChange({ campusId: "ALL" })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-colors cursor-pointer"
            >
              <Building2 className="w-3 h-3 text-cyan-400" />
              <span>Campus: {selectedCampus.name}</span>
              <X className="w-3 h-3 ml-0.5 opacity-70 hover:opacity-100" />
            </button>
          )}

          {filters.role !== "ALL" && (
            <button
              onClick={() => onFilterChange({ role: "ALL" })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-semibold hover:bg-purple-500/30 transition-colors cursor-pointer"
            >
              <SelectedRoleIcon className="w-3 h-3" />
              <span>Role: {selectedRole.label}</span>
              <X className="w-3 h-3 ml-0.5 opacity-70 hover:opacity-100" />
            </button>
          )}

          {filters.searchQuery && (
            <button
              onClick={() => {
                setLocalSearch("");
                onFilterChange({ searchQuery: "" });
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-medium hover:bg-white/15 transition-colors cursor-pointer"
            >
              <Search className="w-3 h-3 text-slate-300" />
              <span>&ldquo;{filters.searchQuery}&rdquo;</span>
              <X className="w-3 h-3 ml-0.5 opacity-70 hover:opacity-100" />
            </button>
          )}
        </div>
      )}

      {/* ── Bottom Row: Dynamic Results Counter & Clear Action ───── */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 text-slate-400 font-sans">
          <span>
            Found <strong className="text-white font-semibold">{getDynamicCountLabel()}</strong>
          </span>
          {hasActiveFilters && (
            <span className="text-pgc-red font-medium flex items-center gap-1">
              • Filtered
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-pgc-red transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
