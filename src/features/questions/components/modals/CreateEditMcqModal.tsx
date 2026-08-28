"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
  Check,
  Timer,
  Loader2,
  AlertCircle,
  Sparkles,
  Code2,
  Languages,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuestionBankStore } from "../../store/useQuestionBankStore";
import {
  createQuestionAction,
  updateQuestionAction,
} from "../../actions/questionActions";
import type { Difficulty, CognitiveType } from "../../types/questionTypes";
import type { ScriptType } from "@/features/curriculum/types/curriculumTypes";

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
  const [showLatexHelper, setShowLatexHelper] = useState(false);

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
      // Default to active topic, or first topic in active chapter, or first available topic
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
    setShowLatexHelper(false);
  }, [editMcqData, isCreateEditMcqOpen, activeTopicId, activeChapterId, vaultData]);

  const handleOptionChange = (idx: number, value: string) => {
    const updated = [...options] as [string, string, string, string];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleInsertLatex = (latex: string) => {
    setPrompt((prev) => `${prev} $${latex}$`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId) {
      setError("Please select a topic for this question.");
      return;
    }
    if (!prompt.trim()) {
      setError("Question prompt is required.");
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      setError("All 4 option fields must be filled.");
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
          options,
          correct_option_index: correctOptionIndex,
          difficulty,
          cognitive_type: cognitiveType,
          script_type: scriptType,
          time_limit_sec: timeLimitSec,
          explanation: explanation.trim() || null,
          is_active: isActive,
        });

        if (!res.success) throw new Error(res.error || "Failed to update question");
      } else {
        const res = await createQuestionAction({
          topic_id: topicId,
          prompt: prompt.trim(),
          options,
          correct_option_index: correctOptionIndex,
          difficulty,
          cognitive_type: cognitiveType,
          script_type: scriptType,
          time_limit_sec: timeLimitSec,
          explanation: explanation.trim() || null,
          is_active: isActive,
        });

        if (!res.success) throw new Error(res.error || "Failed to create question");
      }

      await fetchQuestions();
      await fetchVaultData();
      closeCreateMcq();
    } catch (err: any) {
      console.error("MCQ modal error:", err);
      setError(err.message || "Failed to save question");
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

          {/* Question Prompt + LaTeX Math Helper */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Question Prompt <span className="text-pgc-red">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowLatexHelper(!showLatexHelper)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Code2 className="w-3 h-3" />
                <span>{showLatexHelper ? "Hide LaTeX" : "LaTeX Math Helper"}</span>
              </button>
            </div>

            {showLatexHelper && (
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Snippets:</span>
                <button
                  type="button"
                  onClick={() => handleInsertLatex("\\frac{a}{b}")}
                  className="px-2 py-0.5 rounded bg-black/60 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-white/10"
                >
                  \frac&#123;a&#125;&#123;b&#125;
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertLatex("\\sqrt{x}")}
                  className="px-2 py-0.5 rounded bg-black/60 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-white/10"
                >
                  \sqrt&#123;x&#125;
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertLatex("x^2 + y^2 = r^2")}
                  className="px-2 py-0.5 rounded bg-black/60 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-white/10"
                >
                  x^2
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertLatex("\\sum_{i=1}^n")}
                  className="px-2 py-0.5 rounded bg-black/60 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-white/10"
                >
                  \sum
                </button>
              </div>
            )}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="State the examination or tournament question prompt here..."
              rows={3}
              required
              className={`w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 resize-none ${
                scriptType === "URDU_NASTALIQ"
                  ? "font-urdu-nastaliq text-right leading-loose text-sm"
                  : scriptType === "ARABIC"
                  ? "font-arabic text-right leading-loose text-sm"
                  : "font-sans"
              }`}
            />
          </div>

          {/* 4 Options Grid with Correct Answer Radio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Options &amp; Correct Answer Selection <span className="text-pgc-red">*</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold">
                Click Radio to Set Correct Answer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.map((opt, idx) => {
                const isCorrect = correctOptionIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/50"
                        : "bg-black/40 border-white/10"
                    }`}
                  >
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
                      placeholder={`Option ${optionLabels[idx]} text...`}
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

          {/* Pedagogical Explanation */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
              Pedagogical Explanation / Solution Steps (Optional)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Provide solution steps or textbook references to help students during post-match reviews."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 resize-none font-sans"
            />
          </div>

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
