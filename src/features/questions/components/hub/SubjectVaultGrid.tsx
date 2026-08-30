"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, Flame, Plus, Sparkles, Layers } from "lucide-react";
import type { CurriculumNodeVaultCard } from "../../types/questionTypes";

interface SubjectVaultGridProps {
  nodes: CurriculumNodeVaultCard[];
  boardName: string;
  disciplineName: string;
  classLevel: number;
}

export function SubjectVaultGrid({
  nodes,
  boardName,
  disciplineName,
  classLevel,
}: SubjectVaultGridProps) {
  return (
    <section className="space-y-4 animate-in fade-in duration-300">
      {/* ── Context Breadcrumb Header ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center gap-2.5 flex-wrap">
          <BookOpen className="w-4 h-4 text-pgc-red" />
          <h2 className="text-xs font-bold text-white font-display uppercase tracking-wider">
            Available Subject Vaults
          </h2>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-semibold text-slate-300 font-sans">
            {boardName} ➔ {disciplineName} ➔ Class {classLevel}
          </span>
        </div>

        <span className="text-xs text-slate-400 font-display font-semibold">
          <strong className="text-white">{nodes.length}</strong> Subjects Configured
        </span>
      </div>

      {/* ── Subject Cards Grid (Squad Card Style) ────────────────── */}
      {nodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {nodes.map((node) => {
            const isUrdu = node.subject.script_type === "URDU_NASTALIQ";
            const isArabic = node.subject.script_type === "ARABIC";

            return (
              <Link
                key={node.curriculum_node_id}
                href={`/admin/question-bank/${node.curriculum_node_id}`}
                className="group relative flex flex-col justify-between rounded-2xl bg-[#0e111d] hover:bg-[#131728] border border-white/[0.08] hover:border-pgc-red/40 transition-all duration-300 shadow-xl hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)] hover:scale-[1.01] overflow-hidden"
              >
                {/* ── 1. Top Cover Banner ────────────────────────────── */}
                <div className="relative h-32 w-full overflow-hidden bg-black/80">
                  {node.subject.textbook_cover_url ? (
                    <img
                      src={node.subject.textbook_cover_url}
                      alt={node.subject.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pgc-red/30 via-[#0e111d] to-pgc-indigo/40 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-white/20" />
                    </div>
                  )}

                  {/* Gradient Fade to Card Body */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e111d] via-[#0e111d]/50 to-transparent" />

                  {/* Top-Left: Code Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/15 shadow-sm">
                      {node.subject.code}
                    </span>
                  </div>

                  {/* Top-Right: Question Count Badge in Glowing Gold */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-display font-black text-pgc-gold border border-pgc-gold/40 flex items-center gap-1 shadow-sm">
                      <Flame className="w-3 h-3 fill-pgc-gold/40 text-pgc-gold" />
                      <span>{node.question_count} Qs</span>
                    </span>
                  </div>

                  {/* Floating Subject Emblem */}
                  <div className="absolute bottom-2 left-3 z-10">
                    <div className="w-9 h-9 rounded-xl bg-black/90 border border-white/20 flex items-center justify-center p-1.5 shadow-2xl backdrop-blur-md">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                </div>

                {/* ── 2. Card Content Body ─────────────────────────── */}
                <div className="p-4 pt-2 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-base font-display font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate ${
                          isUrdu
                            ? "font-urdu-nastaliq text-right leading-loose"
                            : isArabic
                            ? "font-arabic text-right leading-loose"
                            : "font-display tracking-tight"
                        }`}
                        title={node.subject.name}
                      >
                        {node.subject.name}
                      </h3>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          isUrdu
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-urdu-sans"
                            : isArabic
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-arabic"
                            : "bg-white/10 text-slate-300 border-white/15"
                        }`}
                      >
                        {isUrdu ? "Urdu" : isArabic ? "Arabic" : "Latin"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans truncate">
                      Class {classLevel} • {disciplineName}
                    </p>
                  </div>

                  {/* Metrics Sub-Box */}
                  <div className="rounded-xl bg-black/50 border border-white/5 p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span><strong>{node.chapter_count}</strong> Chapters</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-display font-bold text-pgc-gold">
                      <Flame className="w-3.5 h-3.5 fill-pgc-gold/30" />
                      <span>{node.question_count} Qs</span>
                    </div>
                  </div>

                  {/* ── 3. Bottom Full-Width CTA ────────────────────── */}
                  <div className="w-full py-2.5 rounded-xl bg-white/[0.04] group-hover:bg-pgc-red text-slate-300 group-hover:text-white text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:shadow-pgc-red/25">
                    <span>Open Question Vault</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-14 text-center rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md p-6 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-display">
            No subjects assigned to this stream
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Assign subjects to {disciplineName} ({boardName}) on the Curriculum Management page.
          </p>
          <Link
            href="/admin/curriculum"
            className="px-4 py-2 rounded-xl bg-pgc-red hover:bg-[#c92f1f] text-white text-xs font-bold font-display uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Subjects in Curriculum</span>
          </Link>
        </div>
      )}
    </section>
  );
}
