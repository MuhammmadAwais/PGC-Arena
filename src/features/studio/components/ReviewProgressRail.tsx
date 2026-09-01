"use client";

import { CheckCircle2, XCircle, AlertTriangle, Layers } from "lucide-react";
import { useStudioStore } from "../store/useStudioStore";

export function ReviewProgressRail() {
  const { stagedQuestions, activeCardIndex, setActiveCardIndex } =
    useStudioStore();

  if (stagedQuestions.length === 0) return null;

  return (
    <aside className="w-full lg:w-64 shrink-0 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-4 space-y-3 font-sans shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
            Deck Staging Rail
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
          {stagedQuestions.length} Items
        </span>
      </div>

      {/* Questions List */}
      <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-1 gap-1.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {stagedQuestions.map((q, idx) => {
          const isActive = activeCardIndex === idx;
          const isApproved = q.reviewStatus === "APPROVED";
          const isDiscarded = q.reviewStatus === "DISCARDED";
          const hasLinterFlags = !q.linterReport.isClean;

          let badgeClass =
            "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:bg-white/[0.08]";
          if (isApproved) {
            badgeClass =
              "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
          } else if (isDiscarded) {
            badgeClass =
              "bg-red-500/15 text-red-400 border-red-500/30 line-through opacity-70";
          }

          if (isActive) {
            badgeClass =
              "bg-amber-500/20 text-amber-300 border-amber-500/50 ring-2 ring-amber-400/40 shadow-md";
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setActiveCardIndex(idx)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${badgeClass}`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-mono font-bold shrink-0">
                  #{idx + 1}
                </span>
                <span className="hidden lg:inline text-xs truncate text-slate-300 font-medium">
                  {q.prompt.slice(0, 24)}...
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {hasLinterFlags && (
                  <span title="Linter Warning">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  </span>
                )}
                {isApproved && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {isDiscarded && (
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
