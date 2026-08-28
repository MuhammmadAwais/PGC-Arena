"use client";

import { useRef } from "react";
import {
  Layers,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  BookX,
} from "lucide-react";
import type { Board, DisciplineWithNodes } from "../types/curriculumTypes";
import { SubjectChip } from "./SubjectChip";
import { useCurriculumStore } from "../store/useCurriculumStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DisciplineLaneProps {
  board: Board;
  discipline: DisciplineWithNodes;
}

export function DisciplineLane({ board, discipline }: DisciplineLaneProps) {
  const { selectedClass, openAssignSubject, openEditDiscipline, openDeleteModal } =
    useCurriculumStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  const handleOpenAssign = () => {
    openAssignSubject({
      boardId: board.id,
      boardName: board.name,
      disciplineId: discipline.id,
      disciplineName: discipline.name,
      classLevel: selectedClass,
    });
  };

  const handleEditDiscipline = () => {
    openEditDiscipline(discipline);
  };

  const handleDeleteDiscipline = () => {
    openDeleteModal("discipline", discipline.id, discipline.name);
  };

  return (
    <div className="rounded-2xl bg-black/40 border border-white/[0.08] p-4 sm:p-5 transition-all hover:border-white/15">
      {/* ── Lane Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            {discipline.logo_url ? (
              <img
                src={discipline.logo_url}
                alt={discipline.name}
                className="h-5 w-5 object-contain"
              />
            ) : (
              <Layers className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 className="text-sm font-bold text-white font-display tracking-tight truncate">
              {discipline.name}
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
              {discipline.code}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {discipline.nodes.length} {discipline.nodes.length === 1 ? "Subject" : "Subjects"}
            </span>
          </div>
        </div>

        {/* Scroll Controls & Discipline Menu */}
        <div className="flex items-center gap-1.5">
          {discipline.nodes.length > 2 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={scrollLeft}
                className="h-7 w-7 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="h-7 w-7 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="h-7 w-7 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer outline-none"
              aria-label="Discipline Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl bg-[#0B0C16]/95 border border-white/15 backdrop-blur-xl p-1.5 shadow-2xl text-white z-50 animate-in fade-in-50 zoom-in-95"
            >
              <DropdownMenuItem
                onClick={handleEditDiscipline}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <Edit className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Discipline</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleDeleteDiscipline}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete Discipline</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Horizontal Scrollable Subject Lane ─────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ scrollbarWidth: "thin" }}
      >
        {discipline.nodes.length > 0 ? (
          <>
            {discipline.nodes.map((node) => (
              <SubjectChip
                key={node.id}
                node={node}
                boardName={board.name}
                disciplineName={discipline.name}
              />
            ))}

            {/* Quick Assign CTA at lane end */}
            <button
              type="button"
              onClick={handleOpenAssign}
              className="h-20 min-w-[140px] rounded-2xl border-2 border-dashed border-white/15 hover:border-pgc-red/50 bg-white/[0.02] hover:bg-pgc-red/10 text-slate-400 hover:text-white flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 group"
            >
              <div className="h-6 w-6 rounded-full bg-white/10 group-hover:bg-pgc-red group-hover:text-white flex items-center justify-center text-slate-300 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold font-display uppercase tracking-wider">
                Assign Subject
              </span>
            </button>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 py-6 px-4 rounded-xl bg-white/[0.01] border border-white/[0.05] border-dashed flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <BookX className="w-5 h-5 text-slate-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  No subjects mapped for Class {selectedClass} in this discipline.
                </p>
                <p className="text-[11px] text-slate-600">
                  Link master subjects from the curriculum bank to enable tournament rounds.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAssign}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-pgc-red hover:text-white text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 font-display"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Assign First Subject</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
