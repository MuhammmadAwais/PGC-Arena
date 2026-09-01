"use client";

import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ChevronRight,
  RotateCcw,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Layers,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { useStudioStore } from "../store/useStudioStore";

export function StudioContextHeader() {
  const { context, stagedQuestions, clearSession } = useStudioStore();

  const {
    nodeId,
    boardCode,
    boardName,
    disciplineCode,
    disciplineName,
    classLevel,
    subjectName,
    chapterNumber,
    chapterTitle,
    topicNumber,
    topicTitle,
  } = context as any;

  return (
    <div className="space-y-4 font-sans">
      {/* ── 1. Top Breadcrumbs ────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 flex-wrap">
        <Link
          href="/admin/curriculum"
          className="hover:text-white transition-colors flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-white/70" />
          <span>Curriculum</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link
          href="/admin/library"
          className="hover:text-white transition-colors"
        >
          Digital Library
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link
          href="/admin/question-bank"
          className="hover:text-white transition-colors"
        >
          Question Bank
        </Link>
        {nodeId && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link
              href={`/admin/question-bank/${nodeId}`}
              className="hover:text-white transition-colors"
            >
              {subjectName || "Subject Vault"}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-pgc-red font-display uppercase tracking-wider font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pgc-red" />
          <span>AI Studio</span>
        </span>
      </nav>

      {/* ── 2. Header Banner & Target Context Badges ───────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md shadow-sm">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
              <span>AI Question</span>
              <span className="text-pgc-red">Studio</span>
            </h1>
          </div>

          <p className="text-xs text-slate-400 font-sans">
            Generate verified practice and tournament questions directly from your textbooks using AI.
          </p>

          {/* Active Target Pills */}
          {boardName && (
            <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] text-white border border-white/10 font-bold font-display uppercase">
                {boardCode || boardName}
              </span>
              {disciplineName && (
                <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10 font-sans">
                  {disciplineCode || disciplineName}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-pgc-red/15 text-pgc-red border border-pgc-red/30 font-display font-extrabold uppercase">
                Class {classLevel}
              </span>
              {subjectName && (
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold font-sans">
                  {subjectName}
                </span>
              )}
              {chapterTitle && (
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-sans">
                  Ch {chapterNumber ? `${chapterNumber}: ` : ""}{chapterTitle}
                </span>
              )}
              {topicTitle ? (
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-sans font-semibold">
                  Topic: {topicNumber ? `${topicNumber} ` : ""}{topicTitle}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] text-slate-400 border border-white/10 font-sans">
                  Topic: Prompted / Auto Target
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
