"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, Flame, Plus, Sparkles } from "lucide-react";
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
      {/* ── Step 3 Header & Context Breadcrumb ───────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="h-5 px-2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold font-display uppercase tracking-widest flex items-center">
            STEP 3
          </span>
          <h2 className="text-xs font-bold text-white font-display uppercase tracking-wider">
            Available Subject Vaults
          </h2>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-semibold text-cyan-300">
            {boardName} ➔ {disciplineName} ➔ Class {classLevel}
          </span>
        </div>

        <span className="text-xs text-slate-400 font-display font-semibold">
          <strong className="text-white">{nodes.length}</strong> Subjects Configured
        </span>
      </div>

      {/* ── Subject Cards Grid ───────────────────────────────────── */}
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
                {/* Top: Cover & Details */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-14 w-12 rounded-2xl overflow-hidden bg-black/50 border border-white/15 shrink-0 flex items-center justify-center shadow-md">
                        {node.subject.textbook_cover_url ? (
                          <img
                            src={node.subject.textbook_cover_url}
                            alt={node.subject.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <BookOpen className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                          {node.subject.code}
                        </span>
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
                      </div>
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

                  {node.subject.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 font-sans">
                      {node.subject.description}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Stats & Action Button */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center gap-3 text-xs font-display">
                    <span className="text-slate-400">
                      <strong className="text-white">{node.chapter_count}</strong> Chapters
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-pgc-gold font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-pgc-gold/30" />
                      {node.question_count} Questions
                    </span>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-xl bg-pgc-red/20 group-hover:bg-pgc-red text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md group-hover:shadow-pgc-red/30">
                    <span>Open Vault</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State for stream */
        <div className="py-14 text-center rounded-3xl bg-[#0B0C16]/60 border border-white/10 backdrop-blur-md p-6 space-y-3">
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
