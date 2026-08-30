"use client";

import { useState } from "react";
import {
  Edit2,
  Trash2,
  CheckCircle2,
  Timer,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Question, Difficulty } from "../types/questionTypes";
import { useQuestionBankStore } from "../store/useQuestionBankStore";
import { MathRenderer } from "@/components/ui/MathRenderer";

interface McqCardProps {
  question: Question;
  index: number;
}

export function McqCard({ question, index }: McqCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const {
    openEditMcq,
    openDeleteModal,
    selectedQuestionIds,
    toggleSelectQuestion,
  } = useQuestionBankStore();

  const isSelected = selectedQuestionIds.includes(question.id);
  const isUrdu = question.script_type === "URDU_NASTALIQ";
  const isArabic = question.script_type === "ARABIC";

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
    <div
      className={`group relative p-5 rounded-2xl border transition-all duration-200 space-y-4 backdrop-blur-md shadow-sm ${
        isSelected
          ? "bg-cyan-500/[0.04] border-cyan-400/40 ring-1 ring-cyan-400/20"
          : "bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.08] hover:border-white/[0.14]"
      }`}
    >
      {/* ── Top Row: Metadata & Quick Actions ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        {/* Left: Checkbox + Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelectQuestion(question.id)}
            className="h-4 w-4 rounded bg-black/50 border-white/20 text-cyan-400 focus:ring-0 cursor-pointer accent-cyan-400 mr-1"
          />

          {/* Index Breadcrumb */}
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10">
            #{index + 1}
          </span>

          {question.chapter && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Ch {question.chapter.chapter_number}
              {question.topic ? ` • ${question.topic.topic_number}` : ""}
            </span>
          )}

          {/* Difficulty Badge */}
          <span
            className={`text-[10px] font-display font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wide ${getDifficultyBadge(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>

          {/* Cognitive Type */}
          <span className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10 uppercase tracking-wider">
            {question.cognitive_type}
          </span>

          {/* Timer */}
          <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
            <Timer className="w-3 h-3" />
            {question.time_limit_sec}s
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Edit */}
          <button
            type="button"
            onClick={() => openEditMcq(question)}
            className="h-8 w-8 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Edit MCQ"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => openDeleteModal("question", question.id, `Question #${index + 1}`)}
            className="h-8 w-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Delete MCQ"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Question Stem / Prompt ────────────────────────────────── */}
      <div>
        <div
          className={`text-sm text-white leading-relaxed ${
            isUrdu
              ? "font-urdu-nastaliq text-right text-base leading-loose"
              : isArabic
              ? "font-arabic text-right text-base leading-loose"
              : "font-sans font-medium"
          }`}
        >
          <MathRenderer content={question.prompt} />
        </div>
      </div>

      {/* ── 4 MCQ Options Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {question.options.map((opt, optIdx) => {
          const isCorrect = optIdx === question.correct_option_index;
          const letter = ["A", "B", "C", "D"][optIdx];

          return (
            <div
              key={optIdx}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-colors ${
                isCorrect
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-sm"
                  : "bg-black/30 border-white/[0.06] text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                    isCorrect
                      ? "bg-emerald-500 text-black font-extrabold"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {letter}
                </span>
                <div
                  className={`text-xs ${
                    isUrdu
                      ? "font-urdu-nastaliq text-right text-sm"
                      : isArabic
                      ? "font-arabic text-right text-sm"
                      : "font-sans"
                  } ${isCorrect ? "font-bold text-white" : "font-normal"}`}
                >
                  <MathRenderer content={opt} inline />
                </div>
              </div>

              {isCorrect && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0 font-display">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Correct</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Explanation Toggle ────────────────────────────────────── */}
      {question.explanation && (
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-[11px] font-semibold text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showExplanation ? "Hide Explanation" : "View Pedagogical Explanation"}</span>
            {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showExplanation && (
            <div className="mt-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 leading-relaxed font-sans animate-in fade-in-50 duration-150">
              <MathRenderer content={question.explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
