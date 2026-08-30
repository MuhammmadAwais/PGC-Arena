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
  Edit2,
  Trash2,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { useQuestionBankStore } from "../store/useQuestionBankStore";
import { McqCard } from "./McqCard";
import { BatchSelectionBar } from "./BatchSelectionBar";
import type { Difficulty } from "../types/questionTypes";

export function McqCardGrid() {
  const {
    questions,
    pagination,
    setPage,
    setPageSize,
    isLoadingQuestions,
    selectedQuestionIds,
    toggleSelectQuestion,
    selectAllQuestions,
    clearQuestionSelection,
    openCreateMcq,
    openEditMcq,
    openDeleteModal,
    searchQuery,
    viewMode,
  } = useQuestionBankStore();

  const allSelected =
    questions.length > 0 && selectedQuestionIds.length === questions.length;

  const totalPages = Math.max(1, pagination.totalPages || Math.ceil(pagination.totalCount / pagination.pageSize));
  const startItem = pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.totalCount);

  // Generate page numbers array (with max 5 visible pages)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getDifficultyBadge = (d: Difficulty) => {
    switch (d) {
      case "EASY":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "MEDIUM":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "HARD":
        return "bg-red-500/15 text-red-300 border-red-500/30";
      default:
        return "bg-white/[0.06] text-slate-300 border-white/10";
    }
  };

  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* ── Selection / Counter Bar ───────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          {questions.length > 0 && (
            <button
              type="button"
              onClick={allSelected ? clearQuestionSelection : selectAllQuestions}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>{allSelected ? "Deselect All" : "Select All On Page"}</span>
            </button>
          )}
          <span>•</span>
          <span>
            Showing <strong className="text-white font-display">{startItem}</strong> to{" "}
            <strong className="text-white font-display">{endItem}</strong> of{" "}
            <strong className="text-white font-display">{pagination.totalCount}</strong> questions
          </span>
        </div>

        {/* Rows Per Page Selector (Top Quick Snippet) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">Page size:</span>
          <select
            value={pagination.pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-black/50 border border-white/10 text-white rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:border-white/25 cursor-pointer font-display"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size} className="bg-[#0e111d] text-white">
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Questions List or Table ───────────────────────────────── */}
      {isLoadingQuestions ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-4 h-48"
            />
          ))}
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {viewMode === "cards" ? (
            /* ── Cards Grid View ─────────────────────────────────── */
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <McqCard
                  key={q.id}
                  question={q}
                  index={(pagination.page - 1) * pagination.pageSize + idx}
                />
              ))}
            </div>
          ) : (
            /* ── Compact Data Table View ──────────────────────────── */
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/[0.04] border-b border-white/[0.08] text-[11px] font-display font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={allSelected ? clearQuestionSelection : selectAllQuestions}
                          className="h-3.5 w-3.5 rounded bg-black/50 border-white/20 text-cyan-400 focus:ring-0 cursor-pointer accent-cyan-400"
                        />
                      </th>
                      <th className="p-3 w-12">#</th>
                      <th className="p-3 w-28">Chapter</th>
                      <th className="p-3 min-w-[240px]">Question Prompt</th>
                      <th className="p-3 min-w-[160px]">Correct Answer</th>
                      <th className="p-3 w-24">Difficulty</th>
                      <th className="p-3 w-24">Cognitive</th>
                      <th className="p-3 w-16">Time</th>
                      <th className="p-3 w-20 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {questions.map((q, idx) => {
                      const isSelected = selectedQuestionIds.includes(q.id);
                      const isUrdu = q.script_type === "URDU_NASTALIQ";
                      const isArabic = q.script_type === "ARABIC";
                      const globalIdx = (pagination.page - 1) * pagination.pageSize + idx;
                      const correctOpt = q.options[q.correct_option_index] || "";

                      return (
                        <tr
                          key={q.id}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-cyan-500/[0.06]"
                              : "hover:bg-white/[0.03]"
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectQuestion(q.id)}
                              className="h-3.5 w-3.5 rounded bg-black/50 border-white/20 text-cyan-400 focus:ring-0 cursor-pointer accent-cyan-400"
                            />
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-400">
                            #{globalIdx + 1}
                          </td>
                          <td className="p-3">
                            {q.chapter ? (
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                Ch {q.chapter.chapter_number}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="p-3">
                            <p
                              className={`line-clamp-2 text-white ${
                                isUrdu
                                  ? "font-urdu-nastaliq text-right text-sm"
                                  : isArabic
                                  ? "font-arabic text-right text-sm"
                                  : "font-sans font-medium"
                              }`}
                            >
                              {q.prompt}
                            </p>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                              <span
                                className={`truncate max-w-[180px] font-medium ${
                                  isUrdu ? "font-urdu-nastaliq" : isArabic ? "font-arabic" : ""
                                }`}
                              >
                                {correctOpt}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-display font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wide ${getDifficultyBadge(
                                q.difficulty
                              )}`}
                            >
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10 uppercase tracking-wider">
                              {q.cognitive_type}
                            </span>
                          </td>
                          <td className="p-3 font-display font-bold text-amber-300 text-[11px]">
                            {q.time_limit_sec}s
                          </td>
                          <td className="p-3 text-right pr-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEditMcq(q)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Edit MCQ"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteModal("question", q.id, `Question #${globalIdx + 1}`)
                                }
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                title="Delete MCQ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Bottom Arena Table-Style Pagination Bar ─────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md shadow-sm text-xs">
            {/* Left: Summary & Rows Selector */}
            <div className="flex items-center gap-3 text-slate-400">
              <span>
                Showing <strong className="text-white">{startItem}</strong> to{" "}
                <strong className="text-white">{endItem}</strong> of{" "}
                <strong className="text-white">{pagination.totalCount}</strong> questions
              </span>

              <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
                <span className="text-[11px] text-slate-500">Rows:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-black/50 border border-white/10 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-white/25 cursor-pointer font-display"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size} className="bg-[#0e111d] text-white">
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => setPage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs font-display"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((p) => {
                  const isActive = p === pagination.page;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`min-w-[28px] h-7 px-2 rounded-lg font-medium text-xs transition-colors cursor-pointer font-display ${
                        isActive
                          ? "bg-pgc-red text-white font-bold shadow-sm"
                          : "bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, pagination.page + 1))}
                disabled={pagination.page >= totalPages}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs font-display"
                title="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : searchQuery ? (
        /* Search Empty State */
        <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md p-6">
          <SearchX className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">
            No questions matched &ldquo;{searchQuery}&rdquo;
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans">
            Try adjusting your search terms or clearing the difficulty/cognitive filters.
          </p>
        </div>
      ) : (
        /* Zero State for selected topic/chapter */
        <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md p-8 space-y-4 max-w-md mx-auto">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">
              No questions found in this view
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Add your first multiple-choice question manually or generate a full batch in Question Studio.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateMcq}
            className="px-4 py-2 rounded-xl bg-pgc-red hover:bg-[#c92f1f] text-white text-xs font-bold font-display uppercase tracking-wider inline-flex items-center gap-2 shadow-md shadow-pgc-red/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First MCQ</span>
          </button>
        </div>
      )}

      {/* Floating Batch Selection Bar */}
      <BatchSelectionBar />
    </div>
  );
}
