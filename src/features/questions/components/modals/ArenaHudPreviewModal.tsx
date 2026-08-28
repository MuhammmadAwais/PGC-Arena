"use client";

import { useState, useEffect } from "react";
import {
  X,
  Timer,
  Zap,
  Shield,
  Trophy,
  Flame,
  Check,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuestionBankStore } from "../../store/useQuestionBankStore";

export function ArenaHudPreviewModal() {
  const { hudPreviewQuestion, closeHudPreview } = useQuestionBankStore();

  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showAnswer, setShowAnswer] = useState(true);

  const question = hudPreviewQuestion;

  useEffect(() => {
    if (question) {
      setTimeLeft(question.time_limit_sec || 15);
      setSelectedOption(null);
      setIsLocked(false);
    }
  }, [question]);

  // Countdown timer simulation
  useEffect(() => {
    if (!question || isLocked) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [question, isLocked]);

  if (!question) return null;

  const handleSelectOption = (idx: number) => {
    if (isLocked) return;
    setSelectedOption(idx);
    setIsLocked(true);
  };

  const getScriptFontClass = () => {
    if (question.script_type === "URDU_NASTALIQ") {
      return "font-urdu-nastaliq text-right leading-loose text-lg sm:text-xl";
    }
    if (question.script_type === "ARABIC") {
      return "font-arabic text-right leading-loose text-lg sm:text-xl";
    }
    return "font-sans text-base sm:text-lg";
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <Dialog open={!!question} onOpenChange={(open) => !open && closeHudPreview()}>
      <DialogContent className="max-w-4xl p-0 bg-[#07080E] border-2 border-pgc-red/40 text-white shadow-[0_0_80px_rgba(227,59,41,0.25)] rounded-3xl overflow-hidden backdrop-blur-2xl">
        {/* ── Top Esports HUD Topbar ───────────────────────────────── */}
        <div className="bg-gradient-to-r from-pgc-indigo via-pgc-navy to-pgc-indigo px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-pgc-red/20 border border-pgc-red/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-pgc-red fill-pgc-red/30 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-pgc-red text-white font-display tracking-widest animate-pulse">
                  LIVE ARENA HUD
                </span>
                <span className="text-xs font-bold font-display text-slate-300">
                  {question.chapter?.title || "Tournament Match"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Real-time student buzzer perspective simulation
              </p>
            </div>
          </div>

          {/* Pulsing Timer */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-pgc-gold/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Timer className="w-4 h-4 text-pgc-gold animate-spin" style={{ animationDuration: "4s" }} />
              <span className="font-display text-lg font-extrabold text-pgc-gold tabular-nums">
                {timeLeft}s
              </span>
            </div>

            <button
              type="button"
              onClick={closeHudPreview}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Arena Main Stage ────────────────────────────────────── */}
        <div className="p-6 sm:p-8 space-y-8 relative">
          {/* Subtle Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-48 bg-pgc-indigo/30 blur-3xl pointer-events-none" />

          {/* Question Banner */}
          <div className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 text-cyan-300 font-mono">
                QUESTION #04 • {question.difficulty}
              </span>
              <span className="text-[11px] font-bold text-pgc-gold font-display flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-pgc-gold" />
                +100 PTS FIRST-BLOOD
              </span>
            </div>

            <h2 className={`font-bold text-white leading-relaxed ${getScriptFontClass()}`}>
              {question.prompt}
            </h2>
          </div>

          {/* ── 4 Large Tactile Buzzer Buttons ─────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((opt, idx) => {
              const isCorrectAnswer = question.correct_option_index === idx;
              const isUserSelected = selectedOption === idx;

              let buttonStyle = "bg-white/[0.04] border-white/15 hover:border-white/40 text-white hover:bg-white/[0.08]";

              if (isUserSelected) {
                buttonStyle = isCorrectAnswer
                  ? "bg-emerald-500/25 border-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  : "bg-red-500/25 border-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]";
              } else if (showAnswer && isCorrectAnswer) {
                buttonStyle = "bg-emerald-500/15 border-emerald-500/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between gap-4 text-left transition-all duration-200 cursor-pointer group active:scale-[0.98] ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="h-9 w-9 rounded-xl bg-white/10 group-hover:bg-pgc-red group-hover:text-white font-display text-sm font-extrabold flex items-center justify-center shrink-0 transition-colors shadow-md">
                      {optionLabels[idx]}
                    </span>
                    <span className={`font-semibold truncate ${getScriptFontClass()}`}>
                      {opt}
                    </span>
                  </div>

                  {showAnswer && isCorrectAnswer && (
                    <div className="h-7 w-7 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0 font-bold shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Bottom HUD Footer Controls ─────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs font-sans text-slate-400">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showAnswer}
                  onChange={(e) => setShowAnswer(e.target.checked)}
                  className="rounded bg-black/50 border-white/20 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
                />
                <span className="text-xs text-slate-300 font-medium">Highlight Correct Answer</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTimeLeft(question.time_limit_sec || 15);
                  setSelectedOption(null);
                  setIsLocked(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold font-display uppercase text-[11px] transition-colors cursor-pointer"
              >
                Reset Buzzer Round
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
