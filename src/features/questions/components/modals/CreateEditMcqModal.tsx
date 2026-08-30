"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HelpCircle,
  Check,
  Timer,
  Loader2,
  AlertCircle,
  Sparkles,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useQuestionBankStore } from "../../store/useQuestionBankStore";
import {
  createQuestionAction,
  updateQuestionAction,
} from "../../actions/questionActions";
import type { Difficulty, CognitiveType } from "../../types/questionTypes";
import type { ScriptType } from "@/features/curriculum/types/curriculumTypes";
import { MathInput } from "@/components/ui/MathInput";
import { MathRenderer } from "@/components/ui/MathRenderer";

const UNICODE_TO_LATEX_MAP: Record<string, string> = {
  "²": "^2",
  "³": "^3",
  "⁴": "^4",
  "½": "\\frac{1}{2}",
  "⅓": "\\frac{1}{3}",
  "¼": "\\frac{1}{4}",
  "¾": "\\frac{3}{4}",
  "±": "\\pm ",
  "°": "^\\circ ",
  "≤": "\\le ",
  "≥": "\\ge ",
  "≠": "\\ne ",
  "≈": "\\approx ",
  "∞": "\\infty ",
  "Δ": "\\Delta ",
  "π": "\\pi ",
  "θ": "\\theta ",
  "×": "\\times ",
  "·": "\\cdot ",
  "÷": "\\div ",
  "Ω": "\\Omega ",
  "λ": "\\lambda ",
  "α": "\\alpha ",
  "β": "\\beta ",
  "μ": "\\mu ",
  "√": "\\sqrt{}",
};

function sanitizePastedMath(text: string): string {
  let result = text;
  for (const [unicode, latex] of Object.entries(UNICODE_TO_LATEX_MAP)) {
    result = result.split(unicode).join(latex);
  }
  return result;
}

export function CreateEditMcqModal() {
  const {
    isCreateEditMcqOpen,
    closeCreateMcq,
    editMcqData,
    vaultData,
    activeTopicId,
    activeChapterId,
    fetchQuestions,
    fetchVaultData,
  } = useQuestionBankStore();

  const isEditing = !!editMcqData;

  const [topicId, setTopicId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<[string, string, string, string]>([
    "",
    "",
    "",
    "",
  ]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [cognitiveType, setCognitiveType] = useState<CognitiveType>("CONCEPTUAL");
  const [scriptType, setScriptType] = useState<ScriptType>("LATIN");
  const [timeLimitSec, setTimeLimitSec] = useState<number>(15);
  const [explanation, setExplanation] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flatten all topics for selection dropdown
  const allTopics = (vaultData?.chapters || []).flatMap((c) =>
    c.topics.map((t) => ({
      ...t,
      chapterTitle: `Ch ${c.chapter_number}: ${c.title}`,
    }))
  );

  useEffect(() => {
    if (editMcqData) {
      setTopicId(editMcqData.topic_id);
      setPrompt(editMcqData.prompt);
      setOptions([
        editMcqData.options[0] || "",
        editMcqData.options[1] || "",
        editMcqData.options[2] || "",
        editMcqData.options[3] || "",
      ]);
      setCorrectOptionIndex(editMcqData.correct_option_index);
      setDifficulty(editMcqData.difficulty);
      setCognitiveType(editMcqData.cognitive_type);
      setScriptType(editMcqData.script_type);
      setTimeLimitSec(editMcqData.time_limit_sec);
      setExplanation(editMcqData.explanation || "");
      setIsActive(editMcqData.is_active);
    } else {
      const defaultTopic =
        activeTopicId ||
        allTopics.find((t) => t.chapter_id === activeChapterId)?.id ||
        allTopics[0]?.id ||
        "";

      setTopicId(defaultTopic);
      setPrompt("");
      setOptions(["", "", "", ""]);
      setCorrectOptionIndex(0);
      setDifficulty("MEDIUM");
      setCognitiveType("CONCEPTUAL");
      setScriptType(vaultData?.subject?.script_type || "LATIN");
      setTimeLimitSec(15);
      setExplanation("");
      setIsActive(true);
    }
    setError(null);
  }, [editMcqData, isCreateEditMcqOpen, activeTopicId, activeChapterId, vaultData]);

  const handleOptionChange = (idx: number, value: string) => {
    const updated = [...options] as [string, string, string, string];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleOptionPaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text/plain");
    if (!pastedText) return;

    const sanitized = sanitizePastedMath(pastedText);
    if (sanitized !== pastedText) {
      e.preventDefault();
      const input = e.currentTarget;
      const start = input.selectionStart ?? options[idx].length;
      const end = input.selectionEnd ?? options[idx].length;
      const before = options[idx].substring(0, start);
      const after = options[idx].substring(end);
      handleOptionChange(idx, before + sanitized + after);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId) {
      setError("Please select a valid curriculum topic.");
      return;
    }
    if (!prompt.trim()) {
      setError("Question prompt cannot be empty.");
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      setError("All 4 MCQ options must be filled.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && editMcqData) {
        const res = await updateQuestionAction({
          id: editMcqData.id,
          topic_id: topicId,
          prompt: prompt.trim(),
          options: options.map((o) => o.trim()) as [string, string, string, string],
          correct_option_index: correctOptionIndex,
          difficulty,
          cognitive_type: cognitiveType,
          script_type: scriptType,
          time_limit_sec: timeLimitSec,
          explanation: explanation.trim() || undefined,
          is_active: isActive,
        });

        if (!res.success) {
          setError(res.error || "Failed to update question");
          return;
        }
      } else {
        const res = await createQuestionAction({
          topic_id: topicId,
          prompt: prompt.trim(),
          options: options.map((o) => o.trim()) as [string, string, string, string],
          correct_option_index: correctOptionIndex,
          difficulty,
          cognitive_type: cognitiveType,
          script_type: scriptType,
          time_limit_sec: timeLimitSec,
          explanation: explanation.trim() || undefined,
          is_active: isActive,
        });

        if (!res.success) {
          setError(res.error || "Failed to create question");
          return;
        }
      }

      await fetchVaultData();
      await fetchQuestions();
      closeCreateMcq();
    } catch (err: any) {
      setError(err?.message || "Unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <Dialog open={isCreateEditMcqOpen} onOpenChange={(open) => !open && closeCreateMcq()}>
      <DialogContent className="max-w-2xl p-6 bg-[#0B0C16]/95 border-white/15 text-white backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-pgc-red/10 border border-pgc-red/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-pgc-red" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-white">
                {isEditing ? "Edit Multiple-Choice Question" : "Create New Competitive MCQ"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Configure question prompt, 4 tactile buzzer options, difficulty, and timer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
              Curriculum Topic <span className="text-pgc-red">*</span>
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {allTopics.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#0B0C16] text-white">
                  {t.chapterTitle} ➔ {t.topic_number} {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Question Prompt with MathInput */}
          <MathInput
            label="Question Prompt"
            required
            value={prompt}
            onChange={setPrompt}
            placeholder="Type question prompt with LaTeX math (e.g. Which physical quantity has dimensions $[M L^2 T^{-2}]$?)..."
            rows={3}
          />

          {/* 4 Options Grid with Correct Answer Radio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Options &amp; Correct Answer Selection <span className="text-pgc-red">*</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold">
                Click Option Letter to Set Correct
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.map((opt, idx) => {
                const isCorrect = correctOptionIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/50"
                        : "bg-black/40 border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setCorrectOptionIndex(idx)}
                        className={`h-6 w-6 rounded-lg font-display text-xs font-bold flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isCorrect
                            ? "bg-emerald-500 text-black shadow-sm"
                            : "bg-white/10 text-slate-400 hover:bg-white/20"
                        }`}
                        title="Set as correct answer"
                      >
                        {optionLabels[idx]}
                      </button>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        onPaste={(e) => handleOptionPaste(idx, e)}
                        placeholder={`Option ${optionLabels[idx]} text (e.g. $[M L^2 T^{-2}]$)...`}
                        required
                        className={`flex-1 bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none ${
                          scriptType === "URDU_NASTALIQ"
                            ? "font-urdu-nastaliq text-right"
                            : scriptType === "ARABIC"
                            ? "font-arabic text-right"
                            : "font-sans"
                        }`}
                      />

                      {isCorrect && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                      )}
                    </div>

                    {/* Option Mini KaTeX Preview if LaTeX syntax exists */}
                    {opt.includes("$") && (
                      <div className="text-[11px] text-slate-300 border-t border-white/[0.04] pt-1 px-1">
                        <MathRenderer content={opt} inline />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty, Cognitive, Script & Timer Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Difficulty */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Cognitive Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Cognitive Level
              </label>
              <select
                value={cognitiveType}
                onChange={(e) => setCognitiveType(e.target.value as CognitiveType)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
              >
                <option value="KNOWLEDGE">Knowledge</option>
                <option value="CONCEPTUAL">Conceptual</option>
                <option value="APPLICATION">Application</option>
              </select>
            </div>

            {/* Script Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Typography
              </label>
              <select
                value={scriptType}
                onChange={(e) => setScriptType(e.target.value as ScriptType)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
              >
                <option value="LATIN">Latin (En)</option>
                <option value="URDU_NASTALIQ">اردو (Urdu)</option>
                <option value="ARABIC">عربي (Arabic)</option>
              </select>
            </div>

            {/* Time Limit */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Buzzer Timer (s)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={timeLimitSec}
                onChange={(e) => setTimeLimitSec(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Pedagogical Explanation with MathInput */}
          <MathInput
            label="Pedagogical Explanation / Solution Steps (Optional)"
            value={explanation}
            onChange={setExplanation}
            placeholder="Provide step-by-step solution or textbook references with math formulas (e.g. $[W] = [F][d] = [M L T^{-2}][L] = [M L^2 T^{-2}]$)..."
            rows={2}
            hideChips
          />

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10">
            <div>
              <p className="text-xs font-bold text-white font-display">Active In Tournament Pool</p>
              <p className="text-[11px] text-slate-400">
                When active, match engine can randomly draw this question in live matches.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={closeCreateMcq}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pgc-red to-[#c92f1f] hover:from-[#f04836] hover:to-pgc-red text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pgc-red/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create MCQ"}</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
