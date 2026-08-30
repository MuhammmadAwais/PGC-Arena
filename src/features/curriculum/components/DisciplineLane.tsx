"use client";

import { useRef } from "react";
import {
  Flame,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  BookX,
  GraduationCap,
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
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
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
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 sm:p-6 transition-all hover:border-white/[0.12] space-y-4">
      {/* ── Section Header: Stream Title & Global Actions ─────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/[0.06] pb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-pgc-red/20 to-pgc-indigo/30 border border-pgc-red/30 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-pgc-red" />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <h3 className="text-base font-bold text-white font-display tracking-tight truncate">
              {discipline.name}
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
              {discipline.code}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-display">
              {discipline.nodes.length} {discipline.nodes.length === 1 ? "Subject" : "Subjects"} Mapped
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {discipline.nodes.length > 3 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={scrollLeft}
                className="h-8 w-8 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="h-8 w-8 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenAssign}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-pgc-red text-slate-300 hover:text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-white/10 hover:border-pgc-red"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Subject</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="h-8 w-8 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer outline-none"
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
                <span>Edit Stream Details</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleDeleteDiscipline}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete Stream</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Horizontal Scrollable Subject Cards Lane ───────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
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

            {/* Quick Assign Dashed Card at lane end */}
            <button
              type="button"
              onClick={handleOpenAssign}
              className="min-h-[170px] min-w-[170px] rounded-2xl border-2 border-dashed border-white/15 hover:border-pgc-red/50 bg-white/[0.02] hover:bg-pgc-red/10 text-slate-400 hover:text-white flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shrink-0 group p-4"
            >
              <div className="h-8 w-8 rounded-xl bg-white/10 group-hover:bg-pgc-red group-hover:text-white flex items-center justify-center text-slate-300 transition-colors shadow-md">
                <Plus className="w-4 h-4" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold font-display uppercase tracking-wider text-white">
                  Map Subject
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Add to {discipline.code}
                </p>
              </div>
            </button>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 py-8 px-6 rounded-2xl bg-white/[0.01] border border-white/[0.06] border-dashed flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <BookX className="w-6 h-6 text-slate-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-300 font-display">
                  No subjects mapped for Class {selectedClass} in this discipline.
                </p>
                <p className="text-[11px] text-slate-500">
                  Link master subjects from the curriculum repository to enable competitive tournament matches.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAssign}
              className="px-4 py-2 rounded-xl bg-pgc-red hover:bg-[#c92f1f] text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-pgc-red/20"
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
