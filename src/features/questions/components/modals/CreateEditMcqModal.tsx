"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Timer,
  Loader2,
  AlertCircle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  BookOpen,
  Calculator,
  Type,
  HelpCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useQuestionBankStore } from "../../store/useQuestionBankStore";
import {
  createQuestionAction,
  updateQuestionAction,
} from "../../actions/questionActions";
import type { Difficulty, CognitiveType } from "../../types/questionTypes";
import type { ScriptType } from "@/features/curriculum/types/curriculumTypes";
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

interface MathPaletteItem {
  name: string;
  symbol: string;
  latex: string;
  hint: string;
}

const VISUAL_MATH_PALETTE: { category: string; items: MathPaletteItem[] }[] = [
  {
    category: "Basic Math",
    items: [
      { name: "Fraction", symbol: "a/b", latex: "\\frac{a}{b}", hint: "Fractions e.g. a over b" },
      { name: "Square Root", symbol: "√x", latex: "\\sqrt{x}", hint: "Root of x" },
      { name: "Power", symbol: "x²", latex: "x^{2}", hint: "Superscript exponent" },
      { name: "Subscript", symbol: "x₂", latex: "x_{2}", hint: "Subscript index" },
      { name: "Plus/Minus", symbol: "±", latex: "\\pm ", hint: "Uncertainty / Tolerance" },
      { name: "Multiply", symbol: "×", latex: "\\times ", hint: "Cross product / times" },
      { name: "Divide", symbol: "÷", latex: "\\div ", hint: "Division sign" },
      { name: "Degree", symbol: "°", latex: "^\\circ ", hint: "Angle or temperature" },
    ],
  },
  {
    category: "Physics & Greek",
    items: [
      { name: "Delta", symbol: "Δ", latex: "\\Delta ", hint: "Change in quantity" },
      { name: "Theta", symbol: "θ", latex: "\\theta ", hint: "Angle in degrees/radians" },
      { name: "Pi", symbol: "π", latex: "\\pi ", hint: "Circle constant 3.1415..." },
      { name: "Ohm", symbol: "Ω", latex: "\\Omega ", hint: "Electrical resistance" },
      { name: "Lambda", symbol: "λ", latex: "\\lambda ", hint: "Wavelength" },
      { name: "Micro", symbol: "μ", latex: "\\mu ", hint: "Micro prefix 10^-6" },
      { name: "Tau", symbol: "τ", latex: "\\tau ", hint: "Torque or time constant" },
      { name: "Infinity", symbol: "∞", latex: "\\infty ", hint: "Infinite limit" },
    ],
  },
  {
    category: "Physics Dimensions",
    items: [
      { name: "Work / Energy", symbol: "[M L² T⁻²]", latex: "[M L^2 T^{-2}]", hint: "Joules / Torque" },
      { name: "Force", symbol: "[M L T⁻²]", latex: "[M L T^{-2}]", hint: "Newtons" },
      { name: "Pressure", symbol: "[M L⁻¹ T⁻²]", latex: "[M L^{-1} T^{-2}]", hint: "Pascals" },
      { name: "Power", symbol: "[M L² T⁻³]", latex: "[M L^2 T^{-3}]", hint: "Watts" },
    ],
  },
];

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
  const [showExplanation, setShowExplanation] = useState(false);
  const [showMathGuide, setShowMathGuide] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flatten all topics for selection dropdown
  const allTopics = (vaultData?.chapters || []).flatMap((c) =>
    c.topics.map((t) => ({
      ...t,
      chapterTitle: `Ch ${c.chapter_number}: ${c.title}`,
      chapterNumber: c.chapter_number,
    }))
  );

  const selectedTopic = allTopics.find((t) => t.id === topicId);

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
      setShowExplanation(!!editMcqData.explanation);
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
      setShowExplanation(false);
      setIsActive(true);
    }
    setError(null);
    setShowMathGuide(false);
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

  const handlePromptPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text/plain");
    if (!pastedText) return;

    const sanitized = sanitizePastedMath(pastedText);
    if (sanitized !== pastedText) {
      e.preventDefault();
      const input = e.currentTarget;
      const start = input.selectionStart ?? prompt.length;
      const end = input.selectionEnd ?? prompt.length;
      const before = prompt.substring(0, start);
      const after = prompt.substring(end);
      setPrompt(before + sanitized + after);
    }
  };

  const insertLatexToPrompt = (latex: string) => {
    setPrompt((prev) => {
      // If formula already wrapped or basic sign, add with spacing
      const needsDollar = !latex.startsWith("$") && !latex.includes("$");
      const insertion = needsDollar ? `$${latex}$` : latex;
      return prev ? `${prev} ${insertion}` : insertion;
    });
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
      <DialogContent
        showCloseButton={false}
        className="w-[96vw] max-w-5xl sm:max-w-5xl md:max-w-5xl lg:max-w-5xl p-6 sm:p-7 bg-[#0e111d] border border-white/[0.08] text-white backdrop-blur-2xl rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            {isEditing ? "Edit MCQ" : "Create MCQ"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── 1. Top Metadata Row (16:9 Landscape - Dropdowns with Dark Glass Menus) ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            {/* Left Metadata Badges & Styled Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {/* Badge: #Index / #New */}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10">
                {isEditing ? `#Edit MCQ` : `#New MCQ`}
              </span>

              {/* Topic Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-colors cursor-pointer outline-none max-w-[240px] truncate"
                >
                  <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">
                    {selectedTopic
                      ? `Ch ${selectedTopic.chapterNumber} • ${selectedTopic.topic_number} ${selectedTopic.title}`
                      : "Select Topic"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-cyan-400 shrink-0 ml-0.5" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-80 max-h-72 rounded-2xl bg-[#0B0C16]/95 border border-white/15 backdrop-blur-2xl p-1.5 shadow-2xl text-white z-50 overflow-y-auto"
                >
                  <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1">
                    Curriculum Topics
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10 my-1" />

                  {allTopics.map((t) => (
                    <DropdownMenuItem
                      key={t.id}
                      onClick={() => setTopicId(t.id)}
                      className={`flex flex-col items-start px-2.5 py-1.5 rounded-xl text-xs cursor-pointer ${
                        topicId === t.id
                          ? "bg-cyan-500/20 text-cyan-300 font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-mono">
                        {t.chapterTitle}
                      </span>
                      <span className="truncate w-full font-medium">
                        {t.topic_number} {t.title}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Difficulty Selector Pills */}
              <div className="flex items-center gap-1">
                {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`text-[10px] font-display font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wide transition-all cursor-pointer ${
                      difficulty === d
                        ? d === "EASY"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                          : d === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                          : "bg-red-500/20 text-red-300 border-red-500/40 shadow-sm"
                        : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Cognitive Level Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="flex items-center gap-1 text-[10px] font-display font-bold px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/10 text-slate-300 border border-white/10 uppercase tracking-wider transition-colors cursor-pointer outline-none"
                >
                  <span>{cognitiveType}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-44 rounded-xl bg-[#0B0C16]/95 border border-white/15 backdrop-blur-2xl p-1 shadow-2xl text-white z-50"
                >
                  {(["KNOWLEDGE", "CONCEPTUAL", "APPLICATION"] as const).map((cog) => (
                    <DropdownMenuItem
                      key={cog}
                      onClick={() => setCognitiveType(cog)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider cursor-pointer ${
                        cognitiveType === cog
                          ? "bg-pgc-red/20 text-white font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {cog}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Typography / Script Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="flex items-center gap-1 text-[10px] font-display font-bold px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/10 text-slate-300 border border-white/10 uppercase transition-colors cursor-pointer outline-none"
                >
                  <Type className="w-3 h-3 text-slate-400" />
                  <span>
                    {scriptType === "URDU_NASTALIQ"
                      ? "اردو"
                      : scriptType === "ARABIC"
                      ? "عربي"
                      : "Latin"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-40 rounded-xl bg-[#0B0C16]/95 border border-white/15 backdrop-blur-2xl p-1 shadow-2xl text-white z-50"
                >
                  <DropdownMenuItem
                    onClick={() => setScriptType("LATIN")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs cursor-pointer ${
                      scriptType === "LATIN"
                        ? "bg-cyan-500/20 text-cyan-300 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Latin (English)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setScriptType("URDU_NASTALIQ")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-urdu-sans cursor-pointer ${
                      scriptType === "URDU_NASTALIQ"
                        ? "bg-emerald-500/20 text-emerald-300 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    اردو (Nastaliq)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setScriptType("ARABIC")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-arabic cursor-pointer ${
                      scriptType === "ARABIC"
                        ? "bg-amber-500/20 text-amber-300 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    عربي (Arabic)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Timer Badge Dropdown / Stepper */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="flex items-center gap-1 text-[10px] font-display font-bold px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors cursor-pointer outline-none"
                >
                  <Timer className="w-3 h-3" />
                  <span>{timeLimitSec}s</span>
                  <ChevronDown className="w-2.5 h-2.5 text-amber-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-32 rounded-xl bg-[#0B0C16]/95 border border-white/15 backdrop-blur-2xl p-1 shadow-2xl text-white z-50"
                >
                  {[10, 15, 20, 30, 45, 60].map((t) => (
                    <DropdownMenuItem
                      key={t}
                      onClick={() => setTimeLimitSec(t)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono cursor-pointer ${
                        timeLimitSec === t
                          ? "bg-amber-500/20 text-amber-300 font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {t} Seconds
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right Action: Active Switch + Close (X) */}
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-400">
                  Active
                </span>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <button
                type="button"
                onClick={closeCreateMcq}
                className="h-7 w-7 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── 2. Visual Math Helper Toolbar (Intuitive UX for LaTeX) ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-display uppercase tracking-wider font-bold text-slate-300">
                  Visual Math &amp; Physics Formulas:
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMathGuide(!showMathGuide)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{showMathGuide ? "Close Formula Guide" : "All Formulas & Symbols"}</span>
              </button>
            </div>

            {/* Quick Math Chips with visual symbols & names */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
              {VISUAL_MATH_PALETTE[0].items.concat(VISUAL_MATH_PALETTE[1].items.slice(0, 5)).map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => insertLatexToPrompt(item.latex)}
                  className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 text-[11px] font-sans font-medium transition-all cursor-pointer shadow-sm flex items-center gap-1"
                  title={item.hint}
                >
                  <span className="font-bold text-white font-mono">{item.symbol}</span>
                  <span className="text-[10px] text-slate-400">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Extended Formula Palette Guide (Categorized) */}
            {showMathGuide && (
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-3 animate-in fade-in-50 duration-150">
                {VISUAL_MATH_PALETTE.map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <span className="text-[10px] font-display uppercase tracking-wider text-cyan-400 font-bold block">
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {cat.items.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => insertLatexToPrompt(item.latex)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-slate-200 hover:text-cyan-300 text-xs font-sans transition-all cursor-pointer flex items-center gap-1.5"
                          title={item.hint}
                        >
                          <span className="font-bold text-white font-mono text-sm">{item.symbol}</span>
                          <span className="text-[10px] text-slate-400">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question Prompt Textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onPaste={handlePromptPaste}
              placeholder="Type question stem here (e.g. Which physical quantity has the dimensions of work $[M L^2 T^{-2}]$?)..."
              rows={2}
              required
              className={`w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 text-sm leading-relaxed transition-colors ${
                scriptType === "URDU_NASTALIQ"
                  ? "font-urdu-nastaliq text-right text-base leading-loose"
                  : scriptType === "ARABIC"
                  ? "font-arabic text-right text-base leading-loose"
                  : "font-sans font-medium"
              }`}
            />

            {/* Instant Prompt KaTeX Live Preview (only when text is entered) */}
            {prompt && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white leading-relaxed">
                <span className="text-[10px] font-mono text-cyan-400 mr-2 uppercase tracking-wider font-bold">
                  Live Preview:
                </span>
                <MathRenderer content={prompt} inline />
              </div>
            )}
          </div>

          {/* ── 3. 4 MCQ Options Grid (Exact 16:9 2x2 Landscape Match with Smooth Editing) ── */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="text-[10px] font-display uppercase tracking-wider font-bold">
                Options &amp; Correct Answer Selection:
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold font-display">
                Click Letter Badge (A, B, C, D) to set Correct Answer
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {options.map((opt, idx) => {
                const isCorrect = correctOptionIndex === idx;
                const letter = optionLabels[idx];

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200 shadow-sm ring-1 ring-emerald-500/20"
                        : "bg-black/30 border-white/[0.06] hover:border-white/15 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Letter badge button - Clicking sets correct */}
                        <button
                          type="button"
                          onClick={() => setCorrectOptionIndex(idx)}
                          className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                            isCorrect
                              ? "bg-emerald-500 text-black font-extrabold shadow-sm scale-105"
                              : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                          }`}
                          title={`Click to set Option ${letter} as correct answer`}
                        >
                          {letter}
                        </button>

                        {/* Text Input - Fully editable with native focus */}
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          onPaste={(e) => handleOptionPaste(idx, e)}
                          placeholder={`Option ${letter} text...`}
                          required
                          className={`flex-1 bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none ${
                            scriptType === "URDU_NASTALIQ"
                              ? "font-urdu-nastaliq text-right"
                              : scriptType === "ARABIC"
                              ? "font-arabic text-right"
                              : "font-sans font-medium"
                          } ${isCorrect ? "text-white font-bold" : ""}`}
                        />
                      </div>

                      {/* Correct Indicator / Set Correct Button */}
                      {isCorrect ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0 font-display">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Correct</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCorrectOptionIndex(idx)}
                          className="text-[10px] text-slate-500 hover:text-slate-300 font-display transition-colors cursor-pointer"
                        >
                          Set Correct
                        </button>
                      )}
                    </div>

                    {/* Inline Option KaTeX Math Preview (ONLY if math syntax exists) */}
                    {opt && (opt.includes("$") || opt.includes("^") || opt.includes("\\")) && (
                      <div className="text-xs text-slate-200 border-t border-white/[0.04] pt-1 px-1 font-sans">
                        <span className="text-[10px] font-mono text-cyan-400 mr-1.5 font-bold">Math:</span>
                        <MathRenderer content={opt} inline />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 4. Explanation Section (Collapsible like the MCQ Card) ── */}
          <div className="pt-2 border-t border-white/[0.06] space-y-2">
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-[11px] font-semibold text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showExplanation ? "Hide Explanation" : "View Pedagogical Explanation (Optional)"}</span>
              {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showExplanation && (
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-2 animate-in fade-in-50 duration-150">
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Torque (\tau = r \times F) has dimension [L][M L T^-2] = [M L^2 T^-2], identical to work and energy..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 font-sans"
                />
                {explanation && (
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs text-slate-300">
                    <span className="text-[10px] font-mono text-cyan-400 mr-2 uppercase font-bold">Preview:</span>
                    <MathRenderer content={explanation} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 5. Modal Footer Actions ─────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={closeCreateMcq}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-pgc-red hover:bg-[#c92f1f] text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pgc-red/25 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
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
