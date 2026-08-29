"use client";

import { Building2, Check, Flame, Layers, Sparkles } from "lucide-react";
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
      {/* ── Step 1 Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-5 px-2 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-extrabold font-display uppercase tracking-widest flex items-center">
            STEP 1
          </span>
          <h2 className="text-xs font-bold text-white font-display uppercase tracking-wider">
            Choose Educational Board
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-sans">
          Select board syllabus to explore
        </span>
      </div>

      {/* ── Board Cards Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className={`group relative p-5 rounded-3xl border transition-all duration-200 cursor-pointer backdrop-blur-md flex flex-col justify-between gap-4 overflow-hidden ${
                isSelected
                  ? "bg-gradient-to-br from-cyan-950/40 via-[#0B0C16]/90 to-[#0B0C16] border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.2)] scale-[1.01]"
                  : "bg-[#0B0C16]/80 hover:bg-[#0B0C16]/95 border-white/10 hover:border-white/20 shadow-lg"
              }`}
            >
              {/* Top Row: Emblem & Checkmark */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-colors shadow-md ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                        : "bg-black/50 border-white/10 text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {board.logo_url ? (
                      <img
                        src={board.logo_url}
                        alt={board.name}
                        className="w-7 h-7 object-contain"
                      />
                    ) : (
                      <Building2 className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                        {board.code}
                      </span>
                    </div>
                    <h3
                      className={`text-sm font-bold mt-1 transition-colors ${
                        isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
                      } font-display`}
                    >
                      {board.name}
                    </h3>
                  </div>
                </div>

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="h-6 w-6 rounded-full bg-cyan-400 text-black flex items-center justify-center shrink-0 shadow-lg shadow-cyan-400/30">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Bottom Row: Stats Pills */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/[0.08] text-[11px] font-display flex-wrap">
                <span className="text-slate-400">
                  <strong className="text-white">{stats.disciplinesCount}</strong> Disciplines
                </span>
                <span className="text-white/20">•</span>
                <span className="text-slate-400">
                  <strong className="text-white">{stats.subjectsCount}</strong> Subjects
                </span>
                <span className="text-white/20">•</span>
                <span className="text-pgc-gold font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-pgc-gold/30" />
                  {stats.questionsCount} Qs
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
