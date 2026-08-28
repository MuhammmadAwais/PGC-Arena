"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Database,
  Search,
  BookOpen,
  ChevronRight,
  Flame,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Plus,
  RefreshCw,
} from "lucide-react";
import { getCurriculumData } from "@/features/curriculum/actions/curriculumActions";
import type { Subject, ClassLevel } from "@/features/curriculum/types/curriculumTypes";

export default function QuestionBankHubPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(11);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (classLevel: ClassLevel) => {
    setIsLoading(true);
    try {
      const res = await getCurriculumData(classLevel);
      if (res.success) {
        setSubjects(res.subjects);
      }
    } catch (err) {
      console.error("Failed to load subjects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedClass);
  }, [selectedClass]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    });
  }, [subjects, search]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* ── Top Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pgc-red/30 to-pgc-indigo border border-pgc-red/30 flex items-center justify-center shadow-lg shadow-pgc-red/10">
              <Database className="w-5 h-5 text-pgc-red" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Question Bank <span className="text-pgc-red">Vault</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Institutional MCQ repositories, chapter taxonomy, and competitive match pools.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Class Level Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10">
            <button
              type="button"
              onClick={() => setSelectedClass(11)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
                selectedClass === 11
                  ? "bg-pgc-red/20 text-white border border-pgc-red/50 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Class 11
            </button>
            <button
              type="button"
              onClick={() => setSelectedClass(12)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
                selectedClass === 12
                  ? "bg-pgc-red/20 text-white border border-pgc-red/50 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Class 12
            </button>
          </div>

          <Link
            href="/admin/ai-creation"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Studio</span>
          </Link>
        </div>
      </div>

      {/* ── Search Bar ───────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects by name or code..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pgc-red/50 transition-all font-sans"
        />
      </div>

      {/* ── Subject Vault Cards Grid ─────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-3xl bg-[#0B0C16]/80 border border-white/10 p-6 space-y-4"
            />
          ))}
        </div>
      ) : filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => {
            const isUrdu = sub.script_type === "URDU_NASTALIQ";
            const isArabic = sub.script_type === "ARABIC";

            return (
              <Link
                key={sub.id}
                href={`/admin/question-bank/${sub.id}?classLevel=${selectedClass}`}
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-[#0B0C16]/80 hover:bg-[#0B0C16]/95 border border-white/10 hover:border-pgc-red/50 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-14 w-12 rounded-2xl overflow-hidden bg-black/50 border border-white/15 shrink-0 flex items-center justify-center shadow-md">
                      {sub.textbook_cover_url ? (
                        <img
                          src={sub.textbook_cover_url}
                          alt={sub.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <BookOpen className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">
                        {sub.code}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
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
                  </div>

                  <div>
                    <h3
                      className={`text-base font-bold text-white group-hover:text-cyan-300 transition-colors ${
                        isUrdu
                          ? "font-urdu-nastaliq text-right leading-loose"
                          : isArabic
                          ? "font-arabic text-right leading-loose"
                          : "font-display tracking-tight"
                      }`}
                    >
                      {sub.name}
                    </h3>
                    {sub.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-sans">
                        {sub.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.08] mt-4">
                  <span className="text-[11px] font-bold text-pgc-gold font-display flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-pgc-gold" />
                    <span>Class {selectedClass} Vault</span>
                  </span>

                  <span className="text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-1 transition-colors font-display">
                    <span>Open Vault</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-[#0B0C16]/60 border border-white/10 backdrop-blur-md p-6">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">
            No subjects configured
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Head to Curriculum &amp; Boards to create master academic subjects.
          </p>
        </div>
      )}
    </div>
  );
}
