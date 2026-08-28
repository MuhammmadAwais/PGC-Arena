"use client";

import {
  HelpCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckSquare,
  Square,
  SearchX,
} from "lucide-react";
import { useQuestionBankStore } from "../store/useQuestionBankStore";
import { McqCard } from "./McqCard";
import { BatchSelectionBar } from "./BatchSelectionBar";

export function McqCardGrid() {
  const {
    questions,
    pagination,
    setPage,
    isLoadingQuestions,
    selectedQuestionIds,
    selectAllQuestions,
    clearQuestionSelection,
    openCreateMcq,
    searchQuery,
    viewMode,
  } = useQuestionBankStore();

  const allSelected =
    questions.length > 0 && selectedQuestionIds.length === questions.length;

  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* ── Selection / Counter Bar ───────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {questions.length > 0 && (
            <button
              type="button"
              onClick={allSelected ? clearQuestionSelection : selectAllQuestions}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-pgc-red" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>{allSelected ? "Deselect All" : "Select All On Page"}</span>
            </button>
          )}
          <span>•</span>
          <span>
            Showing <strong className="text-white font-display">{questions.length}</strong> of{" "}
            <strong className="text-white font-display">{pagination.totalCount}</strong> questions
          </span>
        </div>

        {/* Top Pagination Snippet */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-1.5 font-display">
            <span className="text-[11px] text-slate-400">
              Page {pagination.page} / {pagination.totalPages}
            </span>
          </div>
        )}
      </div>

      {/* ── Questions List or Table ───────────────────────────────── */}
      {isLoadingQuestions ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-[#0B0C16]/80 border border-white/10 p-6 space-y-4 h-48"
            />
          ))}
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <McqCard
              key={q.id}
              question={q}
              index={(pagination.page - 1) * pagination.pageSize + idx}
            />
          ))}

          {/* ── Bottom Pagination Bar ──────────────────────────────── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#0B0C16]/80 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer font-display"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1 font-display text-xs">
                <span className="text-slate-400">Page</span>
                <span className="px-2.5 py-1 rounded-lg bg-pgc-red/20 text-white font-bold border border-pgc-red/40">
                  {pagination.page}
                </span>
                <span className="text-slate-400">of {pagination.totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => setPage(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer font-display"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : searchQuery ? (
        /* Search Empty State */
        <div className="py-16 text-center rounded-3xl bg-[#0B0C16]/60 border border-white/10 backdrop-blur-md p-6">
          <SearchX className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">
            No questions matched &ldquo;{searchQuery}&rdquo;
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the difficulty/cognitive filters.
          </p>
        </div>
      ) : (
        /* Zero State for selected topic/chapter */
        <div className="py-16 text-center rounded-3xl bg-[#0B0C16]/60 border border-white/10 backdrop-blur-md p-8 space-y-4 max-w-md mx-auto">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">
              No questions found in this view
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add your first multiple-choice question manually or generate a full batch in Question Studio.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateMcq}
            className="px-4 py-2 rounded-xl bg-pgc-red hover:bg-[#c92f1f] text-white text-xs font-bold font-display uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-pgc-red/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add First MCQ</span>
          </button>
        </div>
      )}

      {/* Floating Batch Selection Bar */}
      <BatchSelectionBar />
    </div>
  );
}
