"use client";

import { useState } from "react";
import {
  Check,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Timer,
  Info,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Question } from "../types/questionTypes";
import { useQuestionBankStore } from "../store/useQuestionBankStore";
import { duplicateQuestionAction } from "../actions/questionActions";

interface McqCardProps {
  question: Question;
  index: number;
}

export function McqCard({ question, index }: McqCardProps) {
  const {
    selectedQuestionIds,
    toggleSelectQuestion,
    openEditMcq,
    openHudPreview,
    openDeleteModal,
    fetchQuestions,
    fetchVaultData,
  } = useQuestionBankStore();

  const [showExplanation, setShowExplanation] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const isSelected = selectedQuestionIds.includes(question.id);

  const getDifficultyBadge = (d: string) => {
    switch (d) {
      case "EASY":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "HARD":
        return "bg-red-500/15 text-red-300 border-red-500/30";
      default:
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    }
  };

  const getScriptFontClass = () => {
    if (question.script_type === "URDU_NASTALIQ") {
      return "font-urdu-nastaliq text-right leading-loose";
    }
    if (question.script_type === "ARABIC") {
      return "font-arabic text-right leading-loose";
    }
    return "font-sans";
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      await duplicateQuestionAction(question.id);
      await fetchQuestions();
      await fetchVaultData();
    } catch (err) {
      console.error("Duplicate error:", err);
    } finally {
      setIsDuplicating(false);
    }
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 p-5 sm:p-6 backdrop-blur-md space-y-4 relative ${
        isSelected
          ? "bg-pgc-red/10 border-pgc-red/50 shadow-xl shadow-pgc-red/10"
          : "bg-[#0B0C16]/80 border-white/10 hover:border-white/20 shadow-lg"
      }`}
    >
      {/* ── Card Header: Badges, Topic path, Checkbox & Actions ─── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelectQuestion(question.id)}
            className="h-4 w-4 rounded bg-black/50 border-white/20 text-pgc-red focus:ring-0 cursor-pointer accent-pgc-red"
          />

          {/* Index / Topic Breadcrumb */}
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 font-mono">
            #{index + 1}
          </span>

          {question.chapter && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-display">
              Ch {question.chapter.chapter_number}
              {question.topic ? ` • ${question.topic.topic_number}` : ""}
            </span>
          )}

          {/* Difficulty Badge */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-display uppercase tracking-wider ${getDifficultyBadge(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>

          {/* Cognitive Type */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 font-display uppercase">
            {question.cognitive_type}
          </span>

          {/* Timer */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 font-display">
            <Timer className="w-3 h-3" />
            {question.time_limit_sec}s
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* HUD Live Preview Button */}
          <button
            type="button"
            onClick={() => openHudPreview(question)}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
            title="Preview in Student Esports HUD"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>HUD</span>
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => openEditMcq(question)}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Edit MCQ"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Duplicate Question"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => openDeleteModal("question", question.id, `MCQ #${index + 1}`)}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            title="Delete MCQ"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Prompt Content ───────────────────────────────────────── */}
      <div className="space-y-2">
        <p className={`text-sm sm:text-base font-bold text-white leading-relaxed ${getScriptFontClass()}`}>
          {question.prompt}
        </p>
      </div>

      {/* ── 4-Options Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
        {question.options.map((opt, optIdx) => {
          const isCorrect = question.correct_option_index === optIdx;

          return (
            <div
              key={optIdx}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                isCorrect
                  ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-500/10"
                  : "bg-black/40 border-white/[0.08] text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  className={`h-6 w-6 rounded-lg font-display text-xs font-bold flex items-center justify-center shrink-0 ${
                    isCorrect
                      ? "bg-emerald-500 text-black shadow-sm"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {optionLabels[optIdx]}
                </span>
                <span className={`text-xs font-medium truncate ${getScriptFontClass()}`}>
                  {opt}
                </span>
              </div>

              {isCorrect && (
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
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
            <div className="mt-2 p-3 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 text-xs text-slate-300 leading-relaxed font-sans animate-in fade-in-50 duration-150">
              {question.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
