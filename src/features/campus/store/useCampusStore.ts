"use client";

import { create } from "zustand";
import { getCampusesData } from "../actions/campusActions";
import type { CampusItem, MemberItem, TeamItem, SavedFilterPreset } from "../types/campusTypes";

export interface FilterState {
  searchQuery: string;
  role: string;
  campusId: string;
  status: string;
  isLeaderOnly: boolean;
  unassignedOnly: boolean;
  isStarredOnly: boolean;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  column: string;
  direction: "asc" | "desc";
}

interface CampusState {
  // Data Cache
  campuses: CampusItem[];
  allMembers: MemberItem[];
  allTeams: TeamItem[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  // View & UI Navigation
  viewMode: "hierarchy" | "directory";
  activeDirectoryTab: "all" | "captains" | "managers" | "teachers" | "students" | "teams";
  activePresetId: string;
  starredCampusIds: string[];

  // Filters
  filters: FilterState;

  // Table Pagination & Sorting per table ID
  pagination: Record<string, PaginationState>;
  sorting: Record<string, SortingState | null>;

  // Actions
  fetchData: (forceRefresh?: boolean) => Promise<void>;
  setViewMode: (mode: "hierarchy" | "directory") => void;
  setActiveDirectoryTab: (tab: "all" | "captains" | "managers" | "teachers" | "students" | "teams") => void;
  setActivePresetId: (id: string) => void;
  setActivePreset: (preset: SavedFilterPreset) => void;
  setFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleStarCampus: (campusId: string) => void;
  setTablePage: (tableId: string, pageIndex: number) => void;
  setTablePageSize: (tableId: string, pageSize: number) => void;
  setTableSorting: (tableId: string, column: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: "",
  role: "ALL",
  campusId: "ALL",
  status: "ALL",
  isLeaderOnly: false,
  unassignedOnly: false,
  isStarredOnly: false,
};

export const useCampusStore = create<CampusState>((set, get) => ({
  campuses: [],
  allMembers: [],
  allTeams: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  viewMode: "hierarchy",
  activeDirectoryTab: "all",
  activePresetId: "all",
  starredCampusIds: (() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pgc_starred_campuses");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  })(),

  filters: DEFAULT_FILTERS,
  pagination: {},
  sorting: {},

  fetchData: async (forceRefresh = false) => {
    // If already loaded and not forced, keep existing cache for instant 0ms transitions
    if (get().isLoaded && !forceRefresh) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await getCampusesData();
      if (result.success) {
        set({
          campuses: result.campuses,
          allMembers: result.allMembers,
          allTeams: result.allTeams,
          isLoaded: true,
          isLoading: false,
        });
      } else {
        set({ error: result.error || "Failed to load data", isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to load data", isLoading: false });
    }
  },

  setViewMode: (viewMode) => set({ viewMode }),

  setActiveDirectoryTab: (activeDirectoryTab) => set({ activeDirectoryTab }),

  setActivePresetId: (activePresetId) => set({ activePresetId }),

  setActivePreset: (preset) =>
    set({
      activePresetId: preset.id,
      filters: {
        searchQuery: preset.filters.searchQuery ?? "",
        role: preset.filters.role ?? "ALL",
        campusId: preset.filters.campusId ?? "ALL",
        status: preset.filters.status ?? "ALL",
        isLeaderOnly: Boolean(preset.filters.isLeaderOnly),
        unassignedOnly: Boolean(preset.filters.unassignedOnly),
        isStarredOnly: Boolean(preset.filters.isStarredOnly),
      },
      pagination: {},
    }),

  setFilters: (updates) =>
    set((state) => ({
      filters: { ...state.filters, ...updates },
      activePresetId: "custom",
      // Reset pagination to first page when filtering
      pagination: {},
    })),

  resetFilters: () =>
    set({
      filters: DEFAULT_FILTERS,
      activePresetId: "all",
      pagination: {},
    }),

  toggleStarCampus: (campusId) => {
    const current = get().starredCampusIds;
    const exists = current.includes(campusId);
    const updated = exists ? current.filter((id) => id !== campusId) : [...current, campusId];

    set({ starredCampusIds: updated });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("pgc_starred_campuses", JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  },

  setTablePage: (tableId, pageIndex) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [tableId]: {
          pageSize: state.pagination[tableId]?.pageSize ?? 5,
          pageIndex,
        },
      },
    })),

  setTablePageSize: (tableId, pageSize) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [tableId]: {
          pageIndex: 0,
          pageSize,
        },
      },
    })),

  setTableSorting: (tableId, column) =>
    set((state) => {
      const current = state.sorting[tableId];
      let next: SortingState | null = null;
      if (!current || current.column !== column) {
        next = { column, direction: "asc" };
      } else if (current.direction === "asc") {
        next = { column, direction: "desc" };
      } else {
        next = null;
      }

      return {
        sorting: {
          ...state.sorting,
          [tableId]: next,
        },
      };
    }),
}));
