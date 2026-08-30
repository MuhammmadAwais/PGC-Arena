"use client";

import { GraduationCap, Flame, Layers, Check } from "lucide-react";
import type { Discipline } from "@/features/curriculum/types/curriculumTypes";

interface DisciplineTabsProps {
  disciplines: Discipline[];
  selectedDisciplineId: string;
  onSelectDiscipline: (disciplineId: string) => void;
  disciplineStatsMap: Map<string, { subjectsCount: number; questionsCount: number }>;
}

export function DisciplineTabs({
  disciplines,
  selectedDisciplineId,
  onSelectDiscipline,
  disciplineStatsMap,
}: DisciplineTabsProps) {
  if (disciplines.length === 0) return null;

  return (
    <section className="space-y-3 animate-in fade-in duration-200">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white font-display uppercase tracking-wider">
            Academic Discipline Stream
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-sans">
          Filter by stream
        </span>
      </div>

      {/* ── Discipline Pill Tabs Lane ─────────────────────────────── */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
        {disciplines.map((discipline) => {
          const isSelected = selectedDisciplineId === discipline.id;
          const stats = disciplineStatsMap.get(discipline.id) || {
            subjectsCount: 0,
            questionsCount: 0,
          };

          return (
            <button
              key={discipline.id}
              type="button"
              onClick={() => onSelectDiscipline(discipline.id)}
              className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer shrink-0 backdrop-blur-md ${
                isSelected
                  ? "bg-cyan-500/[0.08] border-cyan-400/40 text-white shadow-sm"
                  : "bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.08] hover:border-white/[0.14] text-slate-300"
              }`}
            >
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400/30 text-cyan-300"
                    : "bg-black/40 border-white/10 text-slate-400 group-hover:text-white"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-display text-white">
                    {discipline.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                    {discipline.code}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans mt-0.5">
                  <span>
                    <strong className="text-white font-display">{stats.subjectsCount}</strong> Subjects
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-pgc-gold font-display font-semibold flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5 fill-pgc-gold/30" />
                    {stats.questionsCount} Qs
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="h-4 w-4 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0 ml-1">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
