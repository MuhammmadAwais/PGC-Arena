"use client";

import { useState } from "react";
import {
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { StagedQuestion } from "../types/studioTypes";
import { useStudioStore } from "../store/useStudioStore";
import { MathRenderer } from "@/components/ui/MathRenderer";

interface ReviewCardProps {
  question: StagedQuestion;
  index: number;
  total: number;
}

export function ReviewCard({ question, index, total }: ReviewCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { setEditingQuestionId } = useStudioStore();

  const isUrdu = question.script_type === "URDU_NASTALIQ";
  const isArabic = question.script_type === "ARABIC";
  const hasLinterFlags = !question.linterReport.isClean;

  const getDifficultyBadge = () => {
    switch (question.difficulty) {
      case "EASY":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "MEDIUM":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "HARD":
        return "bg-pgc-red/15 text-red-300 border-pgc-red/30";
      default:
        return "bg-white/[0.06] text-slate-300 border-white/10";
    }
  };

  const getStatusBadge = () => {
    switch (question.reviewStatus) {
      case "APPROVED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10 shadow-sm";
      case "DISCARDED":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      default:
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    }
  };

  return (
    <div className="rounded-3xl bg-[#0e111d] border border-white/[0.08] p-6 sm:p-7 space-y-5 shadow-2xl backdrop-blur-2xl transition-all font-sans relative">
      {/* ── 1. Top Metadata & Status Row ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/[0.06] text-white border border-white/10">
            Card #{index + 1} of {total}
          </span>

          <span
            className={`text-xs font-display font-extrabold px-3 py-0.5 rounded-lg border uppercase tracking-wider ${getStatusBadge()}`}
          >
            {question.reviewStatus}
          </span>

          <span
            className={`text-[10px] font-display font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wide ${getDifficultyBadge()}`}
          >
            {question.difficulty}
          </span>

          <span className="text-[10px] font-display font-bold px-2.5 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10 uppercase tracking-wider">
            {question.cognitive_type}
          </span>

          <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10 flex items-center gap-1 font-mono">
            <Timer className="w-3 h-3 text-cyan-400" />
            {question.time_limit_sec || 15}s
          </span>
        </div>

        <button
          type="button"
          onClick={() => setEditingQuestionId(question.id)}
          className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer self-end sm:self-auto"
          title="Quick Edit (Press 'E')"
        >
          <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Edit (E)</span>
        </button>
      </div>

      {/* ── 2. Quality Linter Notice Banner ────────────────────────── */}
      {hasLinterFlags && (
        <div className="p-3.5 rounded-2xl bg-pgc-red/10 border border-pgc-red/30 text-xs text-red-200 space-y-1 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 font-bold font-display uppercase tracking-wider text-pgc-red">
            <AlertTriangle className="w-4 h-4 shrink-0 text-pgc-red" />
            <span>Automated Linter Notice:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-300/90 pl-1">
            {question.linterReport.flags.map((flag, idx) => (
              <li key={idx}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 3. Question Prompt / Stem ──────────────────────────────── */}
      <div className="space-y-1">
        <span className="text-[10px] font-display uppercase tracking-wider font-bold text-slate-500 block">
          Question Stem:
        </span>
        <div
          className={`text-base sm:text-lg text-white font-medium leading-relaxed ${
            isUrdu
              ? "font-urdu-nastaliq text-right text-xl leading-loose"
              : isArabic
              ? "font-arabic text-right text-xl leading-loose"
              : "font-sans font-medium"
          }`}
        >
          <MathRenderer content={question.prompt} />
        </div>
      </div>

      {/* ── 4. 4 Options Grid (2x2 Landscape) ─────────────────────── */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-display uppercase tracking-wider font-bold text-slate-500 block">
          Answer Options:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((opt, optIdx) => {
            const isCorrect = optIdx === question.correct_option_index;
            const letter = ["A", "B", "C", "D"][optIdx];

            return (
              <div
                key={optIdx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  isCorrect
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-100 shadow-md ring-1 ring-emerald-500/30"
                    : "bg-black/40 border-white/[0.08] text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isCorrect
                        ? "bg-emerald-500 text-black font-extrabold shadow-sm"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {letter}
                  </span>
                  <div
                    className={`text-xs sm:text-sm ${
                      isUrdu
                        ? "font-urdu-nastaliq text-right text-base"
                        : isArabic
                        ? "font-arabic text-right text-base"
                        : "font-sans"
                    } ${isCorrect ? "font-bold text-white" : "font-normal"}`}
                  >
                    <MathRenderer content={opt} inline />
                  </div>
                </div>

                {isCorrect && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0 font-display uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. Pedagogical Solution / Explanation ──────────────────── */}
      {question.explanation && (
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-[11px] font-semibold text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>{showExplanation ? "Hide Explanation" : "View Pedagogical Solution"}</span>
            {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showExplanation && (
            <div className="mt-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 leading-relaxed font-sans animate-in fade-in-50 duration-150">
              <MathRenderer content={question.explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
