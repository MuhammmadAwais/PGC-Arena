"use client";

import { useEffect } from "react";
import {
  Check,
  X,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useStudioStore } from "../store/useStudioStore";
import { ReviewCard } from "./ReviewCard";
import { ReviewCardEditMode } from "./ReviewCardEditMode";
import { ReviewProgressRail } from "./ReviewProgressRail";

export function RapidReviewDeck() {
  const {
    stagedQuestions,
    activeCardIndex,
    setActiveCardIndex,
    editingQuestionId,
    setEditingQuestionId,
    approveQuestion,
    discardQuestion,
    undoReview,
  } = useStudioStore();

  const activeQuestion = stagedQuestions[activeCardIndex];

  // ── Keyboard Shortcuts (Enter = Approve, Backspace = Discard, E = Edit, Arrows = Nav) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        editingQuestionId !== null
      ) {
        return;
      }

      if (!activeQuestion) return;

      if (e.key === "Enter") {
        e.preventDefault();
        approveQuestion(activeQuestion.id);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        discardQuestion(activeQuestion.id);
      } else if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        setEditingQuestionId(activeQuestion.id);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveCardIndex(activeCardIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveCardIndex(activeCardIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeQuestion,
    activeCardIndex,
    editingQuestionId,
    approveQuestion,
    discardQuestion,
    setActiveCardIndex,
    setEditingQuestionId,
  ]);

  if (stagedQuestions.length === 0) return null;

  return (
    <section
      id="rapid-review-deck"
      className="space-y-4 font-sans animate-in fade-in duration-300 scroll-mt-6"
    >
      {/* ── Section Title ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white">
            Step 2: 60 FPS Rapid Review Deck
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span>Shortcuts:</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
            Enter: Approve
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
            Backspace: Discard
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
            E: Edit
          </span>
        </div>
      </div>

      {/* ── Workspace 2-Column (Left: Staging Rail | Right: Single Active Card) ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Thumbnail Rail */}
        <ReviewProgressRail />

        {/* Active Card Canvas */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {activeQuestion && (
            <>
              {editingQuestionId === activeQuestion.id ? (
                <ReviewCardEditMode
                  question={activeQuestion}
                  index={activeCardIndex}
                />
              ) : (
                <ReviewCard
                  question={activeQuestion}
                  index={activeCardIndex}
                  total={stagedQuestions.length}
                />
              )}

              {/* ── Bottom Rapid Action Controls ────────────────── */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                {/* Left: Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCardIndex(activeCardIndex - 1)}
                    disabled={activeCardIndex === 0}
                    className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/[0.05] text-xs font-semibold text-white flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  <span className="text-xs font-mono font-bold text-slate-400 px-1">
                    {activeCardIndex + 1} / {stagedQuestions.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveCardIndex(activeCardIndex + 1)}
                    disabled={activeCardIndex === stagedQuestions.length - 1}
                    className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/[0.05] text-xs font-semibold text-white flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Right: Discard / Edit / Approve Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {activeQuestion.reviewStatus !== "INBOX" && (
                    <button
                      type="button"
                      onClick={() => undoReview(activeQuestion.id)}
                      className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      title="Reset status back to Inbox"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}

                  {/* Discard CTA */}
                  <button
                    type="button"
                    onClick={() => discardQuestion(activeQuestion.id)}
                    className="px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Discard (⌫)</span>
                  </button>

                  {/* Edit Toggle CTA */}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingQuestionId(
                        editingQuestionId === activeQuestion.id
                          ? null
                          : activeQuestion.id
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {editingQuestionId === activeQuestion.id
                        ? "Close Edit"
                        : "Edit (E)"}
                    </span>
                  </button>

                  {/* Approve CTA */}
                  <button
                    type="button"
                    onClick={() => approveQuestion(activeQuestion.id)}
                    className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Approve &amp; Next (↵)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
