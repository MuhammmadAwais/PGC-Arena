"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  GraduationCap,
  Layers,
  Plus,
  BookOpen,
  AlertCircle,
  SearchX,
} from "lucide-react";
import { useCurriculumStore } from "@/features/curriculum/store/useCurriculumStore";
import { CurriculumHeader } from "@/features/curriculum/components/CurriculumHeader";
import { BoardCard } from "@/features/curriculum/components/BoardCard";
import { CurriculumSkeleton } from "@/features/curriculum/components/skeletons/CurriculumSkeleton";
import type { BoardWithDisciplines } from "@/features/curriculum/types/curriculumTypes";

// ── Lazy-loaded Modals (Code-Split for performance) ───────────────
const CreateEditBoardModal = dynamic(
  () =>
    import("@/features/curriculum/components/modals/CreateEditBoardModal").then(
      (m) => m.CreateEditBoardModal
    ),
  { ssr: false }
);

const CreateEditDisciplineModal = dynamic(
  () =>
    import(
      "@/features/curriculum/components/modals/CreateEditDisciplineModal"
    ).then((m) => m.CreateEditDisciplineModal),
  { ssr: false }
);

const CreateEditSubjectModal = dynamic(
  () =>
    import("@/features/curriculum/components/modals/CreateEditSubjectModal").then(
      (m) => m.CreateEditSubjectModal
    ),
  { ssr: false }
);

const AssignSubjectModal = dynamic(
  () =>
    import("@/features/curriculum/components/modals/AssignSubjectModal").then(
      (m) => m.AssignSubjectModal
    ),
  { ssr: false }
);

const DeleteCurriculumModal = dynamic(
  () =>
    import("@/features/curriculum/components/modals/DeleteCurriculumModal").then(
      (m) => m.DeleteCurriculumModal
    ),
  { ssr: false }
);

export default function CurriculumAdminPage() {
  const {
    curriculumData,
    isLoaded,
    isLoading,
    error,
    searchQuery,
    selectedClass,
    fetchCurriculum,
    openCreateBoard,
  } = useCurriculumStore();

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  // ── Multi-tier Search Filter ────────────────────────────────────
  const filteredBoardContainers = useMemo(() => {
    if (!curriculumData?.boardContainers) return [];
    if (!searchQuery.trim()) return curriculumData.boardContainers;

    const q = searchQuery.toLowerCase().trim();

    return curriculumData.boardContainers
      .map((board) => {
        const boardMatches =
          board.name.toLowerCase().includes(q) ||
          board.code.toLowerCase().includes(q);

        // Filter disciplines inside this board
        const matchingDisciplines = board.disciplines
          .map((disc) => {
            const discMatches =
              disc.name.toLowerCase().includes(q) ||
              disc.code.toLowerCase().includes(q);

            // Filter subjects inside this discipline
            const matchingNodes = disc.nodes.filter(
              (n) =>
                n.subject.name.toLowerCase().includes(q) ||
                n.subject.code.toLowerCase().includes(q) ||
                (n.subject.description &&
                  n.subject.description.toLowerCase().includes(q))
            );

            if (discMatches || matchingNodes.length > 0) {
              return {
                ...disc,
                nodes: discMatches ? disc.nodes : matchingNodes,
              };
            }
            return null;
          })
          .filter(Boolean) as typeof board.disciplines;

        if (boardMatches || matchingDisciplines.length > 0) {
          return {
            ...board,
            disciplines: boardMatches ? board.disciplines : matchingDisciplines,
          };
        }
        return null;
      })
      .filter(Boolean) as BoardWithDisciplines[];
  }, [curriculumData, searchQuery]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* ── Top Header with Class 11/12 Switcher, Search & Global Stats ── */}
      <CurriculumHeader />

      {/* ── Error Banner ─────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-red-200">Failed to load curriculum hierarchy</p>
            <p className="text-red-400/90 mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchCurriculum(true)}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white font-bold font-display text-[11px] transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Main Content View ────────────────────────────────────── */}
      {isLoading && !isLoaded ? (
        <CurriculumSkeleton />
      ) : filteredBoardContainers.length > 0 ? (
        <div className="space-y-4">
          {filteredBoardContainers.map((board, idx) => (
            <BoardCard
              key={board.id}
              board={board}
              defaultExpanded={idx === 0}
            />
          ))}
        </div>
      ) : searchQuery ? (
        /* Search Empty State */
        <div className="py-16 text-center rounded-3xl bg-[#0B0C16]/60 border border-white/10 backdrop-blur-md">
          <SearchX className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">
            No taxonomy items found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No boards, disciplines, or subjects matched &ldquo;{searchQuery}&rdquo;. Try adjusting your search query.
          </p>
        </div>
      ) : (
        /* Zero Boards Initial Empty State */
        <div className="py-20 text-center rounded-3xl bg-[#0B0C16]/80 border border-white/10 backdrop-blur-md p-8 space-y-4 max-w-xl mx-auto shadow-2xl">
          <div className="h-16 w-16 rounded-3xl bg-pgc-red/10 border border-pgc-red/20 flex items-center justify-center mx-auto text-pgc-red shadow-lg shadow-pgc-red/10">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white font-display">
              No Examination Boards Configured
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Define your first institutional board (e.g. Federal Board, BISE Lahore) to start building class syllabi and academic tracks.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateBoard}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pgc-red to-[#c92f1f] hover:from-[#f04836] hover:to-pgc-red text-white text-xs font-bold font-display uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-pgc-red/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Board</span>
          </button>
        </div>
      )}

      {/* ── Dynamic Modals ────────────────────────────────────────── */}
      <CreateEditBoardModal />
      <CreateEditDisciplineModal />
      <CreateEditSubjectModal />
      <AssignSubjectModal />
      <DeleteCurriculumModal />
    </div>
  );
}
