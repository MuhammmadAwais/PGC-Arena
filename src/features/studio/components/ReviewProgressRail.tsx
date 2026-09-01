"use client";

import { CheckCircle2, XCircle, AlertTriangle, Layers } from "lucide-react";
import { useStudioStore } from "../store/useStudioStore";

export function ReviewProgressRail() {
  const { stagedQuestions, activeCardIndex, setActiveCardIndex } =
    useStudioStore();

  if (stagedQuestions.length === 0) return null;

  return (
    <aside className="w-full lg:w-64 shrink-0 rounded-2xl bg-[#0B0C16]/90 border border-white/[0.08] backdrop-blur-xl p-4 space-y-3 font-sans shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
            Questions List
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
            "bg-white/[0.03] text-slate-300 border-white/10 hover:bg-white/[0.07] hover:border-white/20";

          if (isApproved) {
            badgeClass =
              "bg-emerald-500/10 text-emerald-200 border-emerald-500/25 hover:bg-emerald-500/15";
          } else if (isDiscarded) {
            badgeClass =
              "bg-red-500/10 text-red-300/70 border-red-500/20 line-through opacity-60 hover:opacity-80";
          }

          if (isActive) {
            if (isApproved) {
              badgeClass =
                "bg-emerald-500/[0.18] text-white border-emerald-400/70 ring-1 ring-emerald-400/40 shadow-lg shadow-emerald-950/40";
            } else if (isDiscarded) {
              badgeClass =
                "bg-red-500/[0.15] text-slate-300 border-red-400/60 ring-1 ring-red-400/30 line-through";
            } else {
              badgeClass =
                "bg-amber-400/[0.12] text-white border-amber-400/60 ring-1 ring-amber-400/30 shadow-lg shadow-amber-950/30";
            }
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setActiveCardIndex(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${badgeClass}`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className={`text-xs font-mono font-bold shrink-0 ${
                    isActive
                      ? isApproved
                        ? "text-emerald-300"
                        : "text-amber-400"
                      : isApproved
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  #{idx + 1}
                </span>
                <span className="hidden lg:inline text-xs truncate text-slate-200 font-medium">
                  {q.prompt.slice(0, 26)}...
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {hasLinterFlags && (
                  <span title="Linter Notice">
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
