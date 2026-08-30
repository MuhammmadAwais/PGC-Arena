"use client";

import { useState } from "react";
import {
  GraduationCap,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Building2,
  BookOpen,
  Flame,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import type { BoardWithDisciplines } from "../types/curriculumTypes";
import { DisciplineLane } from "./DisciplineLane";
import { useCurriculumStore } from "../store/useCurriculumStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BoardCardProps {
  board: BoardWithDisciplines;
  defaultExpanded?: boolean;
}

export function BoardCard({ board, defaultExpanded = true }: BoardCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isStarred, setIsStarred] = useState(false);

  const { openEditBoard, openDeleteModal, openCreateDiscipline, selectedClass } =
    useCurriculumStore();

  const totalSubjectsInBoard = board.disciplines.reduce(
    (acc, d) => acc + d.nodes.length,
    0
  );

  const totalQuestionsInBoard = board.disciplines.reduce(
    (acc, d) => acc + d.nodes.reduce((sum, n) => sum + n.question_count, 0),
    0
  );

  const handleEditBoard = () => {
    openEditBoard(board);
  };

  const handleDeleteBoard = () => {
    openDeleteModal("board", board.id, board.name);
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm">
      {/* ── 1. Board Collapsible Master Bar Header (Campus Style) ─── */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative px-6 py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-white/[0.04] overflow-hidden group"
      >
        {/* Full-Width Background Banner Accent */}
        {board.banner_url && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={board.banner_url}
              alt={board.name}
              className="w-full h-full object-cover opacity-15 group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C16] via-[#0B0C16]/80 to-transparent" />
          </div>
        )}

        {/* Left Identity: Star + Crest + Title + Code + Active Badge */}
        <div className="relative flex items-center gap-4 z-10 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsStarred(!isStarred);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isStarred
                ? "text-pgc-gold hover:text-amber-300"
                : "text-white/20 hover:text-white/60"
            }`}
            title={isStarred ? "Starred Board" : "Star this board"}
          >
            <Star className="w-4 h-4" fill={isStarred ? "currentColor" : "none"} />
          </button>

          {/* Board Emblem */}
          <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center p-2 shrink-0 shadow-lg backdrop-blur-md">
            {board.logo_url ? (
              <img
                src={board.logo_url}
                alt={board.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="w-6 h-6 text-cyan-400" />
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-black text-lg text-white group-hover:text-cyan-300 transition-colors truncate">
                {board.name}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono text-cyan-300 uppercase tracking-wider">
                {board.code}
              </span>
              {board.is_active ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-display">
                  <ShieldCheck className="w-3 h-3" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-display">
                  <ShieldAlert className="w-3 h-3" />
                  Archived
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-sans truncate">
              Official Examination Board Syllabus &amp; Academic Framework
            </p>
          </div>
        </div>

        {/* Right Stats & Quick Actions */}
        <div className="relative flex items-center justify-between md:justify-end gap-6 z-10 shrink-0">
          <div className="flex items-center gap-5">
            <div className="text-left md:text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">
                Disciplines
              </p>
              <p className="font-display font-black text-base lg:text-lg text-white">
                {board.disciplines.length}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">
                Subjects
              </p>
              <p className="font-display font-black text-base lg:text-lg text-cyan-400">
                {totalSubjectsInBoard}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">
                Questions
              </p>
              <p className="font-display font-black text-base lg:text-lg text-pgc-gold">
                {totalQuestionsInBoard.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Menu & Expand Chevron */}
          <div
            className="flex items-center gap-2 pl-2"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors cursor-pointer"
                title="Board Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1.5 font-sans z-50">
                <DropdownMenuItem
                  onClick={handleEditBoard}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit Board Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={openCreateDiscipline}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add New Discipline</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 border-t border-white/10" />
                <DropdownMenuItem
                  onClick={handleDeleteBoard}
                  className="gap-2 text-pgc-red hover:bg-pgc-red/10 focus:bg-pgc-red/10 focus:text-pgc-red cursor-pointer text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-pgc-red" />
                  <span>Delete Board</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors cursor-pointer"
              title={isExpanded ? "Collapse Board" : "Expand Board"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Expanded Detail View (Stat Grid + Discipline Lanes) ──── */}
      {isExpanded && (
        <div className="p-6 sm:p-7 space-y-6 animate-in fade-in duration-300 border-t border-white/[0.04] bg-white/[0.01]">
          {/* 4-Card Secondary Stats Strip (Exact Campus Overview Tokens) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                  Disciplines / Tracks
                </p>
                <p className="font-display text-2xl sm:text-3xl font-black text-white mt-0.5 tracking-tight">
                  {board.disciplines.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                  Mapped Subjects
                </p>
                <p className="font-display text-2xl sm:text-3xl font-black text-cyan-400 mt-0.5 tracking-tight truncate">
                  {totalSubjectsInBoard}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                  Est. Question Pool
                </p>
                <p className="font-display text-2xl sm:text-3xl font-black text-pgc-gold mt-0.5 tracking-tight truncate">
                  {totalQuestionsInBoard.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pgc-gold/15 text-pgc-gold flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                  Active Syllabus
                </p>
                <p className="font-display text-xl sm:text-2xl font-black text-pgc-red mt-0.5 tracking-tight">
                  Class {selectedClass}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pgc-red/15 text-pgc-red flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Discipline Streams Sections */}
          <div className="space-y-4 pt-1">
            {board.disciplines.length > 0 ? (
              board.disciplines.map((discipline) => (
                <DisciplineLane
                  key={discipline.id}
                  board={board}
                  discipline={discipline}
                />
              ))
            ) : (
              <div className="py-10 text-center rounded-2xl bg-white/[0.01] border border-white/[0.06] border-dashed space-y-3">
                <Layers className="w-9 h-9 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white font-display">
                  No disciplines added to {board.name} yet
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Create academic tracks like ICS, FSc Pre-Medical, or Pre-Engineering to begin mapping syllabus subjects.
                </p>
                <button
                  type="button"
                  onClick={openCreateDiscipline}
                  className="px-4 py-2 rounded-xl bg-pgc-red hover:bg-[#c92f1f] text-white text-xs font-bold font-display uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add First Discipline</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
