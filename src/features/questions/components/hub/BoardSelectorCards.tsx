"use client";

import { Building2, Check, Flame } from "lucide-react";
import type { Board } from "@/features/curriculum/types/curriculumTypes";

interface BoardSelectorCardsProps {
  boards: Board[];
  selectedBoardId: string;
  onSelectBoard: (boardId: string) => void;
  boardStatsMap: Map<string, { disciplinesCount: number; questionsCount: number; subjectsCount: number }>;
}

export function BoardSelectorCards({
  boards,
  selectedBoardId,
  onSelectBoard,
  boardStatsMap,
}: BoardSelectorCardsProps) {
  return (
    <section className="space-y-3">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white font-display uppercase tracking-wider">
            Educational Examination Board
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-sans">
          Select syllabus board
        </span>
      </div>

      {/* ── Board Cards Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {boards.map((board) => {
          const isSelected = selectedBoardId === board.id;
          const stats = boardStatsMap.get(board.id) || {
            disciplinesCount: 0,
            questionsCount: 0,
            subjectsCount: 0,
          };

          return (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-md flex flex-col justify-between gap-3 overflow-hidden ${
                isSelected
                  ? "bg-cyan-500/[0.06] border-cyan-400/40 shadow-sm"
                  : "bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.08] hover:border-white/[0.14]"
              }`}
            >
              {/* Top Row: Crest, Code & Title */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-colors shadow-sm shrink-0 ${
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-400/30 text-cyan-300"
                        : "bg-black/40 border-white/10 text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {board.logo_url ? (
                      <img
                        src={board.logo_url}
                        alt={board.name}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                        {board.code}
                      </span>
                    </div>
                    <h3
                      className={`text-sm font-bold mt-0.5 transition-colors truncate font-display ${
                        isSelected ? "text-white" : "text-slate-200 group-hover:text-cyan-300"
                      }`}
                      title={board.name}
                    >
                      {board.name}
                    </h3>
                  </div>
                </div>

                {/* Selected Status Indicator */}
                {isSelected && (
                  <div className="h-5 w-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </div>

              {/* Bottom Row: Metric Summary */}
              <div className="flex items-center gap-2 pt-2.5 border-t border-white/[0.06] text-[11px] font-sans flex-wrap">
                <span className="text-slate-400">
                  <strong className="text-white font-display">{stats.disciplinesCount}</strong> Streams
                </span>
                <span className="text-white/20">•</span>
                <span className="text-slate-400">
                  <strong className="text-white font-display">{stats.subjectsCount}</strong> Subjects
                </span>
                <span className="text-white/20">•</span>
                <span className="text-pgc-gold font-display font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-pgc-gold/30" />
                  {stats.questionsCount.toLocaleString()} Qs
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
