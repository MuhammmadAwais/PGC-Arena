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
      {/* ── Step 2 Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-5 px-2 rounded-md bg-pgc-red/20 text-pgc-red border border-pgc-red/30 text-[10px] font-extrabold font-display uppercase tracking-widest flex items-center">
            STEP 2
          </span>
          <h2 className="text-xs font-bold text-white font-display uppercase tracking-wider">
            Choose Academic Discipline Stream
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-sans">
          Select stream to view syllabus subjects
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
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-gradient-to-r from-pgc-red/25 to-[#c92f1f]/20 border-pgc-red/60 text-white shadow-lg shadow-pgc-red/10 scale-[1.01]"
                  : "bg-[#0B0C16]/80 hover:bg-[#0B0C16]/95 border-white/10 hover:border-white/20 text-slate-300"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
                  isSelected
                    ? "bg-pgc-red/30 border-pgc-red/50 text-white"
                    : "bg-black/40 border-white/10 text-slate-400 group-hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
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
                <div className="h-5 w-5 rounded-full bg-pgc-red text-white flex items-center justify-center shrink-0 ml-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
