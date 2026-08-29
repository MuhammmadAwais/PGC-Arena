"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, Flame, SearchX } from "lucide-react";
import type { CurriculumNodeVaultCard } from "../../types/questionTypes";

interface GlobalSearchSubjectGridProps {
  nodes: CurriculumNodeVaultCard[];
  searchQuery: string;
  onClearSearch: () => void;
}

export function GlobalSearchSubjectGrid({
  nodes,
  searchQuery,
  onClearSearch,
}: GlobalSearchSubjectGridProps) {
  return (
    <section className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-cyan-300 font-display">
            SEARCH RESULTS FOR &ldquo;{searchQuery}&rdquo;
          </span>
          <span className="text-slate-400 text-xs">
            ({nodes.length} matches found across all curriculum boards)
          </span>
        </div>

        <button
          type="button"
          onClick={onClearSearch}
          className="text-xs font-semibold text-slate-400 hover:text-white underline cursor-pointer"
        >
          Clear Search &amp; Return to Step-by-Step View
        </button>
      </div>

      {nodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {nodes.map((node) => {
            const isUrdu = node.subject.script_type === "URDU_NASTALIQ";
            const isArabic = node.subject.script_type === "ARABIC";

            return (
              <Link
                key={node.curriculum_node_id}
                href={`/admin/question-bank/${node.curriculum_node_id}`}
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-[#0B0C16]/80 hover:bg-[#0B0C16]/95 border border-white/10 hover:border-pgc-red/50 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl overflow-hidden space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-display">
                        {node.board.code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 font-mono">
                        {node.discipline.code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-pgc-red/20 text-white border border-pgc-red/40 font-display">
                        Class {node.class_level}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isUrdu
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-urdu-sans"
                          : isArabic
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30 font-arabic"
                          : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {isUrdu ? "Urdu" : isArabic ? "Arabic" : "Latin"}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="h-14 w-12 rounded-2xl overflow-hidden bg-black/50 border border-white/15 shrink-0 flex items-center justify-center shadow-md">
                      {node.subject.textbook_cover_url ? (
                        <img
                          src={node.subject.textbook_cover_url}
                          alt={node.subject.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <BookOpen className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                          {node.subject.code}
                        </span>
                      </div>

                      <h3
                        className={`text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate mt-1 ${
                          isUrdu
                            ? "font-urdu-nastaliq text-right leading-loose"
                            : isArabic
                            ? "font-arabic text-right leading-loose"
                            : "font-display tracking-tight"
                        }`}
                      >
                        {node.subject.name}
                      </h3>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {node.board.name} • {node.discipline.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center gap-3 text-[11px] font-display">
                    <span className="text-slate-400">
                      <strong className="text-white">{node.chapter_count}</strong> Chs
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-pgc-gold font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-pgc-gold/30" />
                      {node.question_count} Qs
                    </span>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-pgc-red/20 group-hover:bg-pgc-red text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all">
                    <span>Open Vault</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-14 text-center rounded-3xl bg-[#0B0C16]/60 border border-white/10 backdrop-blur-md p-6 space-y-3">
          <SearchX className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-display">
            No matching subjects found for &ldquo;{searchQuery}&rdquo;
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try checking for typos or searching by subject name (e.g. &ldquo;Mathematics&rdquo;, &ldquo;Physics&rdquo;).
          </p>
          <button
            type="button"
            onClick={onClearSearch}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold font-display uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}
    </section>
  );
}
