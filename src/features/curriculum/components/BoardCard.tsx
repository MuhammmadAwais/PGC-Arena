"use client";

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
}

export function BoardCard({ board }: BoardCardProps) {
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
    <div className="relative rounded-3xl bg-[#0B0C16]/80 border border-white/10 backdrop-blur-md shadow-2xl p-5 sm:p-7 space-y-6 overflow-hidden transition-all duration-300 hover:border-white/20">
      {/* Background Banner / Accent Glow */}
      {board.banner_url ? (
        <div className="absolute inset-0 h-32 w-full overflow-hidden opacity-20 pointer-events-none">
          <img
            src={board.banner_url}
            alt={board.name}
            className="w-full h-full object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0C16]/80 to-[#0B0C16]" />
        </div>
      ) : (
        <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-l from-pgc-red/10 via-pgc-indigo/20 to-transparent blur-2xl pointer-events-none" />
      )}

      {/* ── Board Header ─────────────────────────────────────────── */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-4">
          {/* Board Crest / Logo */}
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/15 p-2 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden backdrop-blur-lg">
            {board.logo_url ? (
              <img
                src={board.logo_url}
                alt={board.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <GraduationCap className="w-7 h-7 text-cyan-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-white font-display tracking-tight">
                {board.name}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-white/10 text-cyan-300 border border-white/15 font-mono">
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

            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
              <span>
                <strong className="text-white font-display">{board.disciplines.length}</strong> Disciplines
              </span>
              <span className="text-white/20">•</span>
              <span>
                <strong className="text-white font-display">{totalSubjectsInBoard}</strong> Mapped Subjects (Class {selectedClass})
              </span>
              <span className="text-white/20">•</span>
              <span className="text-pgc-gold font-display">
                <strong>{totalQuestionsInBoard.toLocaleString()}</strong> Est. Questions
              </span>
            </p>
          </div>
        </div>

        {/* Board Level Options */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer outline-none"
              aria-label="Board Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl bg-[#0B0C16]/95 border border-white/15 backdrop-blur-xl p-1.5 shadow-2xl text-white z-50 animate-in fade-in-50 zoom-in-95"
            >
              <DropdownMenuItem
                onClick={handleEditBoard}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit Board Details</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={openCreateDiscipline}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Discipline</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-t border-white/10" />

              <DropdownMenuItem
                onClick={handleDeleteBoard}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete Board</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Discipline Horizontal Lanes List ───────────────────────── */}
      <div className="space-y-4">
        {board.disciplines.length > 0 ? (
          board.disciplines.map((discipline) => (
            <DisciplineLane
              key={discipline.id}
              board={board}
              discipline={discipline}
            />
          ))
        ) : (
          <div className="py-8 text-center rounded-2xl bg-black/20 border border-white/[0.05] border-dashed">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">
              No disciplines added to {board.name} yet.
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Create academic tracks like ICS, FSc Pre-Medical, or Pre-Engineering to begin mapping subjects.
            </p>
            <button
              type="button"
              onClick={openCreateDiscipline}
              className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer font-display"
            >
              + Add First Discipline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
