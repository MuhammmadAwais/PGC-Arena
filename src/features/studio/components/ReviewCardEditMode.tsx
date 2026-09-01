"use client";

import { useState } from "react";
import {
  Save,
  Calculator,
  Check,
} from "lucide-react";
import type { StagedQuestion } from "../types/studioTypes";
import type { Difficulty, CognitiveType } from "@/features/questions/types/questionTypes";
import type { ScriptType } from "@/features/curriculum/types/curriculumTypes";
import { useStudioStore } from "../store/useStudioStore";
import { MathRenderer } from "@/components/ui/MathRenderer";

interface ReviewCardEditModeProps {
  question: StagedQuestion;
  index: number;
}

const QUICK_MATH_CHIPS = [
  { name: "Fraction", latex: "\\frac{a}{b}", symbol: "a/b" },
  { name: "Power", latex: "x^{2}", symbol: "x²" },
  { name: "Root", latex: "\\sqrt{x}", symbol: "√x" },
  { name: "Delta", latex: "\\Delta ", symbol: "Δ" },
  { name: "Theta", latex: "\\theta ", symbol: "θ" },
  { name: "Work", latex: "[M L^2 T^{-2}]", symbol: "[M L² T⁻²]" },
  { name: "Force", latex: "[M L T^{-2}]", symbol: "[M L T⁻²]" },
  { name: "Tau", latex: "\\tau ", symbol: "τ" },
];

export function ReviewCardEditMode({ question, index }: ReviewCardEditModeProps) {
  const { updateStagedQuestion, setEditingQuestionId } = useStudioStore();

  const [prompt, setPrompt] = useState(question.prompt);
  const [options, setOptions] = useState<[string, string, string, string]>([
    question.options[0] || "",
    question.options[1] || "",
    question.options[2] || "",
    question.options[3] || "",
  ]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(question.correct_option_index);
  const [difficulty, setDifficulty] = useState<Difficulty>(question.difficulty);
  const [cognitiveType, setCognitiveType] = useState<CognitiveType>(question.cognitive_type);
  const [scriptType, setScriptType] = useState<ScriptType>(question.script_type);
  const [timeLimitSec, setTimeLimitSec] = useState(question.time_limit_sec || 15);
  const [explanation, setExplanation] = useState(question.explanation || "");

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options] as [string, string, string, string];
    updated[idx] = val;
    setOptions(updated);
  };

  const insertMathToPrompt = (latex: string) => {
    const formatted = latex.startsWith("$") ? latex : `$${latex}$`;
    setPrompt((prev) => (prev ? `${prev} ${formatted}` : formatted));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStagedQuestion(question.id, {
      prompt: prompt.trim(),
      options: options.map((o) => o.trim()) as [string, string, string, string],
      correct_option_index: correctOptionIndex,
      difficulty,
      cognitive_type: cognitiveType,
      script_type: scriptType,
      time_limit_sec: timeLimitSec,
      explanation: explanation.trim() || null,
    });
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <form
      onSubmit={handleSave}
      className="rounded-3xl bg-[#0B0C16] border border-cyan-500/30 p-6 sm:p-7 space-y-5 shadow-2xl backdrop-blur-2xl transition-all font-sans ring-1 ring-cyan-500/20"
    >
      {/* ── 1. Top Controls ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Editing Card #{index + 1}
          </span>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-display uppercase transition-all cursor-pointer ${
                  difficulty === d
                    ? d === "EASY"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : d === "MEDIUM"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Cognitive Level */}
          <select
            value={cognitiveType}
            onChange={(e) => setCognitiveType(e.target.value as CognitiveType)}
            className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[10px] font-display uppercase font-bold text-white focus:outline-none"
          >
            <option value="KNOWLEDGE">Knowledge</option>
            <option value="CONCEPTUAL">Conceptual</option>
            <option value="APPLICATION">Application</option>
          </select>

          {/* Script Type */}
          <select
            value={scriptType}
            onChange={(e) => setScriptType(e.target.value as ScriptType)}
            className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[10px] font-display uppercase font-bold text-white focus:outline-none"
          >
            <option value="LATIN">Latin (English)</option>
            <option value="URDU_NASTALIQ">اردو (Nastaliq)</option>
            <option value="ARABIC">عربي (Arabic)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setEditingQuestionId(null)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Card</span>
          </button>
        </div>
      </div>

      {/* ── 2. Formula Insertion Toolbar ──────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-display uppercase tracking-wider font-bold text-slate-300">
            Insert Math / Dimension Token:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_MATH_CHIPS.map((chip) => (
            <button
              key={chip.name}
              type="button"
              onClick={() => insertMathToPrompt(chip.latex)}
              className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-slate-200 text-xs font-mono transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="font-bold text-white">{chip.symbol}</span>
              <span className="text-[10px] text-slate-400">{chip.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. Question Prompt Input ──────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-slate-400 font-display block">
          Question Stem (Supports LaTeX $...$):
        </label>
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          className={`w-full px-3.5 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 text-sm leading-relaxed ${
            scriptType === "URDU_NASTALIQ"
              ? "font-urdu-nastaliq text-right text-lg"
              : scriptType === "ARABIC"
              ? "font-arabic text-right text-lg"
              : "font-sans font-medium"
          }`}
        />

        {prompt && (
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-white">
            <span className="text-[10px] font-mono text-cyan-400 mr-2 font-bold uppercase">
              Preview:
            </span>
            <MathRenderer content={prompt} inline />
          </div>
        )}
      </div>

      {/* ── 4. 4 Options Editor (Click Letter to Set Correct) ──────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
            Options (Click Letter to Set Correct Answer):
          </label>
          <span className="text-[10px] text-emerald-400 font-bold font-display">
            Current Answer: Option {optionLabels[correctOptionIndex]}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((opt, idx) => {
            const isCorrect = correctOptionIndex === idx;
            const letter = optionLabels[idx];

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                  isCorrect
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 ring-1 ring-emerald-500/20"
                    : "bg-black/40 border-white/10 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setCorrectOptionIndex(idx)}
                    className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                      isCorrect
                        ? "bg-emerald-500 text-black font-extrabold shadow-sm"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                    title={`Click to set Option ${letter} as correct`}
                  >
                    {letter}
                  </button>

                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    required
                    placeholder={`Option ${letter}...`}
                    className={`w-full bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none ${
                      scriptType === "URDU_NASTALIQ"
                        ? "font-urdu-nastaliq text-right text-sm"
                        : scriptType === "ARABIC"
                        ? "font-arabic text-right text-sm"
                        : "font-sans font-medium"
                    }`}
                  />
                </div>

                {isCorrect && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0 font-display">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. Pedagogical Explanation ────────────────────────────── */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-slate-400 font-display block">
          Pedagogical Solution / Explanation (Optional):
        </label>
        <textarea
          rows={2}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Step-by-step calculation or physical principle..."
          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 font-sans"
        />
      </div>
    </form>
  );
}
