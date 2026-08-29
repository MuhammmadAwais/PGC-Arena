"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  BookOpen,
  Search,
  Plus,
  Zap,
  LayoutGrid,
  List,
  Sparkles,
  Flame,
  Languages,
  Filter,
  X,
  GraduationCap,
  Shield,
} from "lucide-react";
import { useQuestionBankStore } from "../store/useQuestionBankStore";
import type { Difficulty, CognitiveType } from "../types/questionTypes";

export function QuestionVaultHeader() {
  const router = useRouter();
  const {
    vaultData,
    searchQuery,
    setSearchQuery,
    filters,
    setDifficultyFilter,
    setCognitiveFilter,
    setScriptFilter,
    viewMode,
    setViewMode,
    activeChapterId,
    activeTopicId,
    openCreateMcq,
  } = useQuestionBankStore();

  const board = vaultData?.board;
  const discipline = vaultData?.discipline;
  const subject = vaultData?.subject;
  const classLevel = vaultData?.classLevel || 11;
  const stats = vaultData?.stats || {
    totalChapters: 0,
    totalTopics: 0,
    totalQuestions: 0,
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0,
  };

  const handleLaunchStudio = () => {
    const params = new URLSearchParams();
    if (vaultData?.curriculum_node_id) params.set("nodeId", vaultData.curriculum_node_id);
    if (subject?.id) params.set("subjectId", subject.id);
    params.set("classLevel", classLevel.toString());
    if (activeChapterId) params.set("chapterId", activeChapterId);
    if (activeTopicId) params.set("topicId", activeTopicId);

    router.push(`/admin/ai-creation?${params.toString()}`);
  };

  return (
    <div className="space-y-5">
      {/* ── 1. Top Breadcrumbs ───────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 flex-wrap">
        <Link
          href="/admin/curriculum"
          className="hover:text-white transition-colors flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Curriculum</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link
          href="/admin/question-bank"
          className="hover:text-white transition-colors"
        >
          Question Bank
        </Link>
        {board && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300">{board.code || board.name}</span>
          </>
        )}
        {discipline && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300">{discipline.code || discipline.name}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-cyan-400 font-mono">Class {classLevel}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-pgc-red font-display uppercase tracking-wider font-bold">
          {subject ? subject.name : "Subject Vault"}
        </span>
      </nav>

      {/* ── 2. Subject Metadata Banner & Global Actions ───────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#0B0C16]/80 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4 min-w-0">
          {/* Subject Cover / Thumbnail */}
          <div className="h-16 w-14 rounded-2xl overflow-hidden bg-black/50 border border-white/15 shrink-0 relative flex items-center justify-center shadow-lg">
            {subject?.textbook_cover_url ? (
              <img
                src={subject.textbook_cover_url}
                alt={subject.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-7 h-7 text-cyan-400" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight truncate">
                {subject?.name || "Subject Question Vault"}
              </h1>
              {board && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-display">
                  {board.code}
                </span>
              )}
              {discipline && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 font-mono">
                  {discipline.code}
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-pgc-red/20 text-white border border-pgc-red/40 font-display">
                Class {classLevel}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  subject?.script_type === "URDU_NASTALIQ"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-urdu-sans"
                    : subject?.script_type === "ARABIC"
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30 font-arabic"
                    : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                }`}
              >
                {subject?.script_type === "URDU_NASTALIQ"
                  ? "Urdu Nastaliq"
                  : subject?.script_type === "ARABIC"
                  ? "Arabic Script"
                  : "Latin Script"}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
              <span>
                <strong className="text-white font-display">{stats.totalChapters}</strong> Chapters
              </span>
              <span className="text-white/20">•</span>
              <span>
                <strong className="text-white font-display">{stats.totalTopics}</strong> Topics
              </span>
              <span className="text-white/20">•</span>
              <span className="text-pgc-gold font-display flex items-center gap-1 font-bold">
                <Flame className="w-3.5 h-3.5 fill-pgc-gold/30 text-pgc-gold" />
                {stats.totalQuestions} Questions Vaulted
              </span>
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 flex-wrap self-start lg:self-center">
          <button
            type="button"
            onClick={handleLaunchStudio}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer hover:scale-[1.02]"
            title="Launch Question Studio AI Generator"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span>⚡ AI Studio</span>
          </button>

          <button
            type="button"
            onClick={openCreateMcq}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pgc-red to-[#c92f1f] hover:from-[#f04836] hover:to-pgc-red text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pgc-red/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add MCQ</span>
          </button>
        </div>
      </div>

      {/* ── 3. Search & Multi-Filter Control Strip ─────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0B0C16]/80 border border-white/10 backdrop-blur-md shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by prompt or option text..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pgc-red/50 font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty Filter */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-sans">
            <span className="text-slate-500 px-2 font-display text-[10px] uppercase font-bold">Diff:</span>
            {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficultyFilter(d)}
                className={`px-2.5 py-1 rounded-lg font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
                  filters.difficulty === d
                    ? d === "EASY"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : d === "MEDIUM"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : d === "HARD"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : "bg-white/15 text-white border border-white/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {d === "ALL" ? "All" : d}
              </button>
            ))}
          </div>

          {/* Cognitive Type Filter */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-sans">
            <span className="text-slate-500 px-2 font-display text-[10px] uppercase font-bold">Cognitive:</span>
            {(["ALL", "KNOWLEDGE", "CONCEPTUAL", "APPLICATION"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCognitiveFilter(c)}
                className={`px-2 py-1 rounded-lg font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
                  filters.cognitiveType === c
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {c === "ALL" ? "All" : c.slice(0, 4)}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white/15 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact-table")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "compact-table"
                  ? "bg-white/15 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Compact Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
