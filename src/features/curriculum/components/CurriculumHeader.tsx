"use client";

import {
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  Layers,
  GraduationCap,
  Sparkles,
  BookMarked,
  HelpCircle,
  X,
} from "lucide-react";
import { useCurriculumStore } from "../store/useCurriculumStore";
import type { ClassLevel } from "../types/curriculumTypes";

export function CurriculumHeader() {
  const {
    selectedClass,
    setSelectedClass,
    searchQuery,
    setSearchQuery,
    curriculumData,
    isLoading,
    fetchCurriculum,
    openCreateBoard,
    openCreateDiscipline,
    openCreateSubject,
  } = useCurriculumStore();

  const stats = curriculumData?.stats || {
    totalBoards: 0,
    totalDisciplines: 0,
    totalSubjects: 0,
    totalNodes: 0,
    totalQuestions: 0,
  };

  return (
    <div className="space-y-6">
      {/* ── Top Row: Title, Subtitle, & Quick Actions ─────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pgc-red/30 to-pgc-indigo border border-pgc-red/30 flex items-center justify-center shadow-lg shadow-pgc-red/10">
              <BookOpen className="w-5 h-5 text-pgc-red" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Curriculum &amp; <span className="text-pgc-red">Boards</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Manage examination boards, academic disciplines, and curriculum subjects.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => fetchCurriculum(true)}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Curriculum Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-pgc-gold" : ""}`} />
          </button>

          <button
            type="button"
            onClick={openCreateSubject}
            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer hover:border-white/30"
          >
            <BookMarked className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ New Subject</span>
          </button>

          <button
            type="button"
            onClick={openCreateDiscipline}
            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer hover:border-white/30"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>+ New Discipline</span>
          </button>

          <button
            type="button"
            onClick={openCreateBoard}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pgc-red to-[#c92f1f] hover:from-[#f04836] hover:to-pgc-red text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pgc-red/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Board</span>
          </button>
        </div>
      </div>

      {/* ── Middle Row: Class 11 vs 12 Segmented Switcher & Search Bar ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3 rounded-2xl bg-[#0B0C16]/80 border border-white/10 backdrop-blur-md shadow-xl">
        {/* Segmented Pill Class Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedClass(11)}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              selectedClass === 11
                ? "bg-pgc-red/20 text-white border border-pgc-red/50 shadow-md shadow-pgc-red/10"
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <GraduationCap className={`w-3.5 h-3.5 ${selectedClass === 11 ? "text-pgc-red" : "text-slate-500"}`} />
            <span>Class 11 (1st Year)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedClass(12)}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              selectedClass === 12
                ? "bg-pgc-red/20 text-white border border-pgc-red/50 shadow-md shadow-pgc-red/10"
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <GraduationCap className={`w-3.5 h-3.5 ${selectedClass === 12 ? "text-pgc-red" : "text-slate-500"}`} />
            <span>Class 12 (2nd Year)</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search board, discipline, subject or code..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pgc-red/50 focus:ring-1 focus:ring-pgc-red/50 transition-all font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Bottom Strip: Quick Stats HUD ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-display">Active Boards</p>
            <p className="text-base font-extrabold text-white font-display">{stats.totalBoards}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-display">Disciplines</p>
            <p className="text-base font-extrabold text-white font-display">{stats.totalDisciplines}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <BookMarked className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-display">Master Subjects</p>
            <p className="text-base font-extrabold text-white font-display">{stats.totalSubjects}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-display">Class {selectedClass} Mappings</p>
            <p className="text-base font-extrabold text-white font-display">{stats.totalNodes}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex items-center gap-3 col-span-2 sm:col-span-1 lg:col-span-1">
          <div className="h-9 w-9 rounded-xl bg-pgc-red/10 border border-pgc-red/20 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4 text-pgc-red" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-display">Est. Question Pool</p>
            <p className="text-base font-extrabold text-pgc-gold font-display">{stats.totalQuestions.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
